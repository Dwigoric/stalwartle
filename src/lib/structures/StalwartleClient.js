const { SapphireClient, container } = require('@sapphire/framework');
const { Manager } = require('erela.js');
const { SpotifyParser } = require('spotilink');
const { join } = require('path');
const { Util: { escapeMarkdown } } = require('discord.js');
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
const { mergeObjects } = require('@sapphire/utilities');

require('dotenv').config();

class Stalwartle extends SapphireClient {

    constructor(clientOptions) {
        super(clientOptions);

        container.erela = null;
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
            }).catch(err => container.logger.error(err));
        }
        if (process.env.TOPGG_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://top.gg/api/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({ server_count: await this.guildCount(), shard_count: this.options.shardCount }), // eslint-disable-line camelcase
                headers: { Authorization: process.env.TOPGG_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => container.logger.error(err));
        }
        if (process.env.DISCORDBOTLIST_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://discordbotlist.com/api/v1/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({
                    guilds: await this.guildCount(),
                    users: await this.userCount(),
                    voice_connections: Array.from(container.erela.players.size).filter(player => player.playing).length // eslint-disable-line camelcase
                }),
                headers: { Authorization: `Bot ${process.env.DISCORDBOTLIST_API_KEY}`, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => container.logger.error(err));
        }
        if (process.env.DISCORDBOTSGG_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://discord.bots.gg/api/v1/bots/${this.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({ guildCount: await this.guildCount() }),
                headers: { Authorization: process.env.DISCORDBOTSGG_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => container.logger.error(err));
        }
        if (process.env.BOTLISTSPACE_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://api.botlist.space/v2/bots/${this.user.id}`, {
                method: 'POST',
                body: JSON.stringify({ server_count: await this.guildCount() }), // eslint-disable-line camelcase
                headers: { Authorization: process.env.BOTLISTSPACE_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => container.logger.error(err));
        }
        if (process.env.BOTSONDISCORD_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://bots.ondiscord.xyz/bot-api/bots/${this.user.id}/guilds`, {
                method: 'POST',
                body: JSON.stringify({ guildCount: await this.guildCount() }),
                headers: { Authorization: process.env.BOTSONDISCORD_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => container.logger.error(err));
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
        container.erela = container.erela || new Manager({
            autoPlay: true,
            nodes: lavalinkNodes,
            clientId: this.user.id,
            shards: this.options.shardCount,
            trackPartial: ['author', 'duration', 'isSeekable', 'isStream', 'requester', 'title', 'uri', 'incognito'],
            send(id, payload) {
                const guild = container.client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            }
        })
            .on('nodeConnect', node => container.logger.info(`Node ${node.options.identifier} connected.`))
            .on('nodeError', (node, error) => container.logger.error(`Node ${node.options.identifier} had an error: ${error.message}`))
            .on('trackStart', async (player, track) => {
                const guildGateway = container.stores.get('gateways').get('guildGateway');

                if (guildGateway.get(player.guild, 'donation') >= 3 && !track.incognito) {
                    const { history } = container.stores.get('gateways').get('musicGateway').get(player.guild);
                    history.unshift(mergeObjects(track, { timestamp: Date.now() }));
                    container.stores.get('gateways').get('musicGateway').update(player.guild, { history });
                }

                const announceChannel = this.channels.cache.get(player.textChannel);
                // eslint-disable-next-line max-len
                if (announceChannel && guildGateway.get(player.guild).music.announceSongs && announceChannel.permissionsFor(this.user).has('SEND_MESSAGES')) announceChannel.send(`🎧  ::  Now Playing: **${escapeMarkdown(track.title)}** by ${escapeMarkdown(track.author)} (Requested by **${escapeMarkdown(await this.guilds.cache.get(player.guild).members.fetch(track.requester.id).then(req => req.displayName).catch(() => track.requester.tag))}** - more info on \`${guildGateway.get(player.guild, 'prefix')}np\`).`);
            })
            .on('trackEnd', async (player, track) => {
                const guildGateway = container.stores.get('gateways').get('guildGateway');
                const { queue } = container.stores.get('gateways').get('musicGateway').get(player.guild);

                if (guildGateway.get(player.guild, 'music.repeat') === 'queue') queue.push(queue[0]);
                if (guildGateway.get(player.guild, 'music.repeat') !== 'song') queue.shift();
                if (guildGateway.get(player.guild, 'donation') >= 8 && guildGateway.get(player.guild, 'music.autoplay') && !queue.length) {
                    const params = new URLSearchParams();
                    params.set('part', 'snippet');
                    params.set('relatedToVideoId', track.identifier);
                    params.set('type', 'video');
                    params.set('key', process.env.GOOGLE_API_KEY); // eslint-disable-line no-process-env
                    const { items } = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`).then(res => res.json());
                    if (items && items.length) {
                        const relatedVideo = items[Math.floor(Math.random() * items.length)];
                        const songResult = relatedVideo ? await player.search(`https://youtu.be/${relatedVideo.id.videoId}`, this.user).catch(error => {
                            this.channels.cache.get(player.textChannel).send(error.message);
                            return null;
                        }) : null;

                        if (songResult) queue.push(mergeObjects(songResult.tracks[0], { requester: this.container.client.user.id, incognito: false }));
                    }
                }

                await this.container.stores.get('gateways').get('musicGateway').update(player.guild, { queue });
            })
            .on('trackError', (player, track, payload) => {
                const channel = this.channels.cache.get(player.textChannel);
                channel.send(`${this.container.constants.EMOTES.xmark}  ::  An error occurred while playing the track: ${payload.exception.message} (${payload.exception.severity})`);
            })
            .on('trackStuck', player => {
                const channel = this.channels.cache.get(player.textChannel);
                channel.send(`${this.container.constants.EMOTES.loading}  ::  It seems that the player is stuck! It could be buffering.`);
            })
            .on('queueEnd', player => {
                const guildGateway = container.stores.get('gateways').get('guildGateway');

                if (guildGateway.get(player.guild, 'donation') < 10) this.setTimeout((guildID) => container.erela.destroy(guildID), 1000 * 60 * 5, player.guild);

                const channel = this.channels.cache.get(player.textChannel);
                if (channel) channel.send(`👋  ::  No song left in the queue, so the music session has ended! Play more music with \`${guildGateway.get(player.guild, 'prefix')}play <song search>\`!`);
            });
        container.spotifyParser = new SpotifyParser(lavalinkNodes[0], process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET); // eslint-disable-line no-process-env
        container.erela.nodes.forEach(node => node.connect());
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
