const { SapphireClient } = require('@sapphire/framework');
const { Manager } = require('@lavacord/discord.js');
// const { SpotifyParser } = require('spotilink');
const { join } = require('path');
const fetch = require('node-fetch');

const { config: { lavalinkNodes } } = require('../../config');

const constants = require('../util/constants');
const auth = require('../../auth');

// Imports for data persistence
const PersistenceManager = require('./settings/PersistenceManager');
const Gateway = require('./settings/Gateway');
const schema = require('../util/schema');

// Imports for cached data
const CacheManager = require('./cache/CacheManager');
const GuildCacheData = require('./cache/GuildCacheData');
const MemberCacheData = require('./cache/MemberCacheData');

// Imports for tasks
const TaskStore = require('./tasks/TaskStore');
const Task = require('./tasks/Task');

// Imports for schedule
const Schedule = require('./schedule/Schedule');

class Stalwartle extends SapphireClient {

    constructor(clientOptions) {
        super(clientOptions);

        this.lavacord = null;
        // this.spotifyParser = null;
        this.constants = constants;
        this.auth = auth;

        this.once('ready', this._initplayer.bind(this));

        this.provider = new PersistenceManager();
        this.schedule = new Schedule(this);

        this._intervals = new Set();
        this._timeouts = new Set();

        this.stores.register(new TaskStore(Task).registerPath(join(__dirname, '..', 'tasks')));

        this.gateways = {
            guilds: new Gateway(this, 'guilds', schema.guilds),
            users: new Gateway(this, 'users', schema.users),
            client: new Gateway(this, 'clientStorage', schema.client),
            afk: new Gateway(this, 'afk', schema.afk),
            music: new Gateway(this, 'music', schema.music),
            modlogs: new Gateway(this, 'modlogs', schema.modlogs)
        };

        this.cache = {
            guilds: new CacheManager(this, GuildCacheData),
            members: new CacheManager(this, MemberCacheData)
        };

        this.application = null;
        this.ready = false;
    }

    get settings() {
        return this.gateways.client.get(this.user.id);
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
        for (const gateway in this.gateways) {
            await this.gateways[gateway].init().catch(() => new Error(`Could not load Collection ${gateway} to cache.`));
            console.log(`Loaded Collection ${gateway} to cache.`);
        }
        console.log('The gateways have been loaded.');
        return super.login(token);
    }

    _initplayer() {
        this.lavacord = this.lavacord || new Manager(this, lavalinkNodes, {
            user: this.user.id,
            shards: this.options.shardCount
        });
        // this.spotifyParser = new SpotifyParser(lavalinkNodes[0], this.auth.spotifyClientID, this.auth.spotifyClientSecret);
        if (!this.lavacord.idealNodes.length) this.lavacord.connect();
        return true;
    }

    setTimeout(fn, delay, ...args) {
        const timeout = setTimeout(() => {
            fn(...args);
            this._timeouts.delete(timeout);
        }, delay);
        this._timeouts.add(timeout);
        return timeout;
    }

    clearTimeout(timeout) {
        clearTimeout(timeout);
        this._timeouts.delete(timeout);
    }

    setInterval(fn, delay, ...args) {
        const interval = setInterval(fn, delay, ...args);
        this._intervals.add(interval);
        return interval;
    }

    clearInterval(interval) {
        clearInterval(interval);
        this._intervals.delete(interval);
    }

}

module.exports = Stalwartle;
