const { SapphireClient } = require('@sapphire/framework');
const { Manager } = require('@lavacord/discord.js');
const { SpotifyParser } = require('spotilink');
const fetch = require('node-fetch');

const { config: { lavalinkNodes } } = require('../../config');

const constants = require('../util/constants');
const auth = require('../../auth');

const PersistenceManager = require('./settings/PersistenceManager');
const Settings = require('./settings/Settings');
const schema = require('../util/schema');

require('./StalwartleGuild');
require('./StalwartleGuildMember');

class Stalwartle extends SapphireClient {

    constructor(clientOptions) {
        super(clientOptions);

        this.playerManager = null;
        this.spotifyParser = null;
        this.constants = constants;
        this.auth = auth;

        this.once('ready', this._initplayer.bind(this));

        this.provider = new PersistenceManager();

        this.settings = {
            guilds: new Settings(this, 'guilds', schema.guilds),
            users: new Settings(this, 'users', schema.users),
            client: new Settings(this, 'clientStorage', schema.client)
        };

        this.application = null;
        this.ready = false;

        Stalwartle.defaultPermissionLevels
            .add(5, ({ guild, member }) => guild && (!guild.settings.get('music.dj').length || guild.settings.get('music.dj').some(role => member.roles.cache.keyArray().includes(role))))
            .add(6, ({ guild, member }) => guild && (guild.settings.get('moderators.roles').some(role => member.roles.cache.keyArray().includes(role)) || guild.settings.get('moderators.users').includes(member.id))) // eslint-disable-line max-len
            .add(7, ({ guild, member }) => guild && member.permissions.has('MANAGE_GUILD'))
            .add(8, ({ guild, member }) => guild && member.permissions.has('ADMINISTRATOR'))
            .add(9, ({ author }) => clientOptions.owners.includes(author.id))
            .add(10, ({ author }) => clientOptions.ownerID === author.id, { break: true });
    }

    async postStats() {
        if (this.auth.ctxAPIkey) {
            fetch('https://www.carbonitex.net/discord/data/botdata.php', {
                method: 'POST',
                body: JSON.stringify({ key: this.auth.ctxAPIkey, server_count: await this.guildCount() }), // eslint-disable-line camelcase
                headers: { 'Content-Type': 'application/json' }
            });
        }
        if (this.auth.dblAPIkey) {
            fetch(`https://top.gg/api/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({ server_count: await this.guildCount(), shard_count: this.options.shardCount }), // eslint-disable-line camelcase
                headers: { Authorization: this.auth.dblAPIkey, 'Content-Type': 'application/json' }
            });
        }
        if (this.auth.dbl2APIkey) {
            fetch(`https://discordbotlist.com/api/v1/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({
                    guilds: await this.guildCount(),
                    users: await this.userCount(),
                    voice_connections: Array.from(this.playerManager.players.values()).filter(player => player.playing).length // eslint-disable-line camelcase
                }),
                headers: { Authorization: `Bot ${this.auth.dbl2APIkey}`, 'Content-Type': 'application/json' }
            });
        }
        if (this.auth.dcbAPIkey) {
            fetch(`https://discord.bots.gg/api/v1/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({ guildCount: await this.guildCount() }),
                headers: { Authorization: this.auth.dcbAPIkey, 'Content-Type': 'application/json' }
            });
        }
        if (this.auth.blsAPIkey) {
            fetch(`https://api.botlist.space/v1/bots/${this.user.id}`, {
                method: 'POST',
                body: JSON.stringify({ server_count: await this.guildCount() }), // eslint-disable-line camelcase
                headers: { Authorization: this.auth.blsAPIkey, 'Content-Type': 'application/json' }
            });
        }
        if (this.auth.bodAPIkey) {
            fetch(`https://bots.ondiscord.xyz/bot-api/bots/${this.user.id}/guilds`, {
                method: 'POST',
                body: JSON.stringify({ guildCount: await this.guildCount() }),
                headers: { Authorization: this.auth.bodAPIkey, 'Content-Type': 'application/json' }
            });
        }
    }

    async guildCount() {
        let guilds = 0;
        if (this.shard) {
            const results = await this.shard.broadcastEval('this.guilds.cache.size');
            for (const result of results) guilds += result;
        } else {
            guilds = this.guilds.cache.size;
        }
        return guilds;
    }

    async userCount() {
        let users = 0;
        if (this.shard) {
            const results = await this.shard.broadcastEval('this.guilds.cache.reduce((a, b) => a + b.memberCount, 0)');
            for (const result of results) users += result;
        } else {
            users = this.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
        }
        return users;
    }

    async login(token) {
        await this.provider.init().catch(() => new Error('Could not establish connection to MongoDB.'));
        console.log('Connection to MongoDB has been established.');
        for (const setting in this.settings) await this.settings[setting].init().catch(() => new Error(`Could not load Collection ${setting} to cache. Aborting.`));
        console.log('The databases have been loaded.');
        return super.login(token);
    }

    _initplayer() {
        this.playerManager = this.playerManager || new Manager(this, lavalinkNodes, {
            user: this.user.id,
            shards: this.options.shardCount
        });
        this.spotifyParser = new SpotifyParser(lavalinkNodes[0], this.auth.spotifyClientID, this.auth.spotifyClientSecret);
        if (!this.playerManager.idealNodes.length) this.playerManager.connect();
        return true;
    }

}

module.exports = Stalwartle;
