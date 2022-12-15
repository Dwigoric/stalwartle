const { SapphireClient, container } = require('@sapphire/framework');
const { Manager } = require('erela.js');
const { join } = require('path');
const { Util: { escapeMarkdown } } = require('discord.js');
const { mergeObjects } = require('@sapphire/utilities');
// const Spotify = require('erela.js-spotify');
// const fetch = require('node-fetch');

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

class Stalwartle extends SapphireClient {

    constructor(clientOptions) {
        super(clientOptions);

        container.erela = null;
        container.constants = require('../util/constants');

        this.once('ready', this.initializeErela.bind(this));

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

    initializeErela() {
        container.erela = container.erela || new Manager({
            autoPlay: true,
            defaultSearchPlatform: 'soundcloud',
            nodes: lavalinkNodes,
            clientId: this.user.id,
            shards: this.options.shardCount,
            trackPartial: ['author', 'duration', 'isSeekable', 'isStream', 'requester', 'title', 'uri', 'identifier', 'incognito'],
            /*
            plugins: [
                new Spotify({
                    clientID: process.env.SPOTIFY_CLIENT_ID, // eslint-disable-line no-process-env
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET, // eslint-disable-line no-process-env,
                    playlistLimit: 0,
                    albumLimit: 0
                })
            ],
            */
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
                const requester = await this.guilds.cache.get(player.guild).members.fetch(track.requester, { cache: false }).catch(() => this.users.fetch(track.requester, { cache: false }).then(user => `**${user.tag}**`));

                if (announceChannel && guildGateway.get(player.guild).music.announceSongs && announceChannel.permissionsFor(this.user).has('SEND_MESSAGES')) {
                    announceChannel.send({
                        allowedMentions: { parse: [] },
                        content: `🎧  ::  Now Playing: **${escapeMarkdown(track.title)}** by ${escapeMarkdown(track.author)} (Requested by ${requester} - more info on \`${guildGateway.get(player.guild, 'prefix')}np\`).`
                    });
                }
            })
            .on('trackEnd', player => {
                container.cache.guilds.get(player.guild).clearVoteskips();
                const queue = Array.from(player.queue);
                queue.unshift(player.queue.current);
                container.stores.get('gateways').get('musicGateway').update(player.guild, { queue });
            })
            .on('trackError', (player, track, payload) => {
                const channel = this.channels.cache.get(player.textChannel);
                channel.send([
                    `${container.constants.EMOTES.xmark}  ::  An error occurred while playing the track:`,
                    `${payload.exception ? payload.exception.message : '(No message received)'}`,
                    `(SEVERITY: ${payload.exception ? payload.exception.severity : 'Unknown'})`
                ].join(' '));
            })
            .on('trackStuck', player => {
                const channel = this.channels.cache.get(player.textChannel);
                channel.send(`${container.constants.EMOTES.loading}  ::  It seems that the player is stuck! It could be buffering.`);
            })
            .on('playerMove', (player, oldChannel, newChannel) => {
                player.voiceChannel = newChannel;
                return;
            })
            .on('socketClosed', player => {
                const { channel } = this.guilds.cache.get(player.guild).me.voice;
                if (channel) {
                    if (channel.members.filter(member => !member.user.bot).size) player.pause(false);
                    else container.stores.get('listeners').get('Autopause').addAutopaused(player.guild);
                } else {
                    player.destroy();
                }
            })
            .on('queueEnd', async (player) => {
                container.cache.guilds.get(player.guild).clearVoteskips();

                await container.stores.get('gateways').get('musicGateway').reset(player.guild, 'queue');
                const { donation, prefix } = container.stores.get('gateways').get('guildGateway').get(player.guild);
                const channel = this.channels.cache.get(player.textChannel);

                /*
                if (donation >= 8 && music.autoplay) {
                    const params = new URLSearchParams();
                    params.set('part', 'snippet');
                    params.set('relatedToVideoId', track.identifier);
                    params.set('type', 'video');
                    params.set('key', process.env.GOOGLE_API_KEY); // eslint-disable-line no-process-env
                    const { items } = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`).then(res => res.json());
                    if (items && items.length) {
                        const relatedVideo = items[Math.floor(Math.random() * items.length)];
                        const songResult = relatedVideo ? await player.search(`https://youtu.be/${relatedVideo.id.videoId}`, this.user.id).catch(error => {
                            if (channel) channel.send(`${container.constants.EMOTES.xmark}  ::  ${error.message}`);
                            return null;
                        }) : null;

                        if (songResult) {
                            if (!songResult.exception) {
                                player.queue.add(mergeObjects(songResult.tracks[0], { incognito: false }));
                                return player.play();
                            }
                            if (channel) channel.send(`${container.constants.EMOTES.xmark}  ::  ${songResult.exception.message} (Severity: ${songResult.exception.severity})`);
                        }
                    }
                }
                */

                if (donation < 10) {
                    const { timeouts } = container.stores.get('commands').get('play');
                    timeouts.set(player.guild, setTimeout((guildID) => {
                        player.destroy();
                        clearTimeout(timeouts.get(guildID));
                        timeouts.delete(guildID);
                    }, 1000 * 60 * 5, player.guild));
                }

                if (channel) channel.send(`👋  ::  No song left in the queue, so the music session has ended! Play more music with \`${prefix}play <song search>\`!`);
                return null;
            });

        container.erela.init(this.user.id);
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
