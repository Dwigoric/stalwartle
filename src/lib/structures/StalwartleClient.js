const { SapphireClient, container } = require('@sapphire/framework');
const { Manager } = require('@lavacord/discord.js');
const { SpotifyParser } = require('spotilink');
const { join } = require('path');
const fetch = require('node-fetch');

const { config: { lavalinkNodes } } = require('../../config');

// Register editable-commands plugin
require('@sapphire/plugin-editable-commands/register');

// Imports for data persistence
const PersistenceManager = require('./settings/PersistenceManager');
const GatewayStore = require('./settings/GatewayStore');
const Gateway = require('./settings/Gateway');

// Imports for cached data
const CacheManager = require('./cache/CacheManager');
const GuildCacheData = require('./cache/GuildCacheData');
const MemberCacheData = require('./cache/MemberCacheData');

require('dotenv').config();

class Stalwartle extends SapphireClient {

    constructor(clientOptions) {
        super(clientOptions);

        container.lavacord = null;
        container.spotifyParser = null;
        container.constants = require('../util/constants');

        this.once('ready', this._initplayer.bind(this));

        container.database = new PersistenceManager();

        this._intervals = new Set();
        this._timeouts = new Set();

        this.stores.register(new GatewayStore(Gateway).registerPath(join(__dirname, '..', '..', 'gateways')));

        container.cache = {
            guilds: new CacheManager(this, GuildCacheData),
            members: new CacheManager(this, MemberCacheData)
        };
    }

    get settings() {
        return container.stores.get('gateways').get('clientGateway').get(this.user.id);
    }

    async postStats() {
        if (process.env.CARBONITEX_API_KEY) { // eslint-disable-line no-process-env
            fetch('https://www.carbonitex.net/discord/data/botdata.php', {
                method: 'POST',
                body: JSON.stringify({ key: process.env.CARBONITEX_API_KEY, server_count: await this.guildCount() }), // eslint-disable-line camelcase,no-process-env
                headers: { 'Content-Type': 'application/json' }
            });
        }
        if (process.env.TOPGG_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://top.gg/api/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({ server_count: await this.guildCount(), shard_count: this.options.shardCount }), // eslint-disable-line camelcase
                headers: { Authorization: process.env.TOPGG_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            });
        }
        if (process.env.DISCORDBOTLIST_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://discordbotlist.com/api/v1/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({
                    guilds: await this.guildCount(),
                    users: await this.userCount(),
                    voice_connections: Array.from(container.lavacord.players.values()).filter(player => player.playing).length // eslint-disable-line camelcase
                }),
                headers: { Authorization: `Bot ${process.env.DISCORDBOTLIST_API_KEY}`, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            });
        }
        if (process.env.DISCORDBOTSGG_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://discord.bots.gg/api/v1/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({ guildCount: await this.guildCount() }),
                headers: { Authorization: process.env.DISCORDBOTSGG_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            });
        }
        if (process.env.BOTLISTSPACE_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://api.botlist.space/v2/bots/${this.user.id}`, {
                method: 'POST',
                body: JSON.stringify({ server_count: await this.guildCount() }), // eslint-disable-line camelcase
                headers: { Authorization: process.env.BOTLISTSPACE_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            });
        }
        if (process.env.BOTSONDISCORD_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://bots.ondiscord.xyz/bot-api/bots/${this.user.id}/guilds`, {
                method: 'POST',
                body: JSON.stringify({ guildCount: await this.guildCount() }),
                headers: { Authorization: process.env.BOTSONDISCORD_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
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

    _initplayer() {
        container.lavacord = container.lavacord || new Manager(this, lavalinkNodes, {
            user: this.user.id,
            shards: this.options.shardCount
        });
        container.spotifyParser = new SpotifyParser(lavalinkNodes[0], process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET); // eslint-disable-line no-process-env
        if (!container.lavacord.idealNodes.length) container.lavacord.connect();
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
