const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Timestamp } = require('@sapphire/time-utilities');
const { mergeObjects } = require('@sapphire/utilities');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

const SPOTIFY_TRACK_REGEX = /https?:\/\/open\.spotify\.com\/track\/([a-z0-9-_]+)/i;
const SPOTIFY_ALBUM_REGEX = /https?:\/\/open\.spotify\.com\/album\/([a-z0-9-_]+)/i;
const SPOTIFY_PLAYLIST_REGEX = /https?:\/\/open\.spotify\.com\/playlist\/([a-z0-9-_]+)/i;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['p'],
            preconditions: ['DJOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Plays music in the server. Accepts YouTube, Spotify, SoundCloud, Vimeo, Mixer, Bandcamp, Twitch, and online radios.',
            flags: ['force', 'incognito', 'soundcloud'],
            detailedDescription: [
                'You can limit the voice channels Stalwartle can connect to for music: `s.conf set music.limitToChannel <channel ID>`.',
                'To continue playing from the current music queue (if stopped), simply do not supply any argument.',
                'To choose which channel I will announce songs, use `s.conf set music.announceChannel <channel>`.',
                'Use SoundCloud with your searches just by simply using the `--soundcloud` flag! e.g. `s.play Imagine Dragons - Natural --soundcloud`',
                'To force play a song, just use the `--force` flag. e.g. `s.play twenty one pilots - Jumpsuit --force`.',
                '\nTo insert a whole YouTube playlist into the queue, just supply the playlist link.',
                'To play directly from Vimeo, Mixer (Beam.pro), Bandcamp, or Twitch, give the video/song/stream\'s link. (or for bandcamp, song/album)',
                'To play an online radio, simply supply the radio link.',
                'To enable autoplay, use `s.conf set music.autoplay true`. This is only applicable for $8+ donators.'
            ].join('\n')
        });

        Object.defineProperty(this, 'timeouts', { value: new Map(), writable: false });
    }

    #prompts = new Map();

    async messageRun(msg, args) {
        const query = await args.pick('url').then(result => result.toString()).catch(() => args.rest('string').catch(() => null));

        const player = this.container.lavacord.players.get(msg.guild.id);

        if (player && !msg.guild.me.voice.channel) await this.container.lavacord.leave(msg.guild.id);
        if (!msg.member.voice.channelId) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please connect to a voice channel first.`);

        const guildGateway = this.container.stores.get('gateways').get('guildGateway');
        if (guildGateway.get(msg.guild.id, 'music.limitToChannel').length && !guildGateway.get(msg.guild.id, 'music.limitToChannel').includes(msg.member.voice.channelId)) {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Your current voice channel is not included in this server's music channels.`);
        }
        if (!msg.member.voice.channel.permissionsFor(this.container.client.user).has(['CONNECT', 'SPEAK', 'VIEW_CHANNEL'])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I do not have the required permissions (**Connect**, **Speak**, **View Channel**) to play music in <#${msg.member.voice.channelId}>.`); // eslint-disable-line max-len
        if (this.#prompts.has(msg.author.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You are currently being prompted. Please pick one first or cancel the prompt.`);

        const musicData = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        const { playlist } = musicData;
        let { queue } = musicData;

        let joinResult;
        if (!query) {
            if (player && player.playing) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Music is playing in this server, however you can still enqueue a song. You can stop the music session using the \`${guildGateway.get(msg.guild.id, 'prefix')}leave\` or \`${guildGateway.get(msg.guild.id, 'prefix')}stop\` command.`); // eslint-disable-line max-len

            if (queue.length) {
                reply(msg, '🎶  ::  No search query provided, but I found tracks in the queue so I\'m gonna play it.');
                joinResult = await this.#join(msg).catch(error => {
                    reply(msg, error.message);
                    return null;
                });
                if (joinResult === null) return null;

                return this.#play(msg, queue[0]);
            }
            // eslint-disable-next-line max-len
            if (!playlist.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the queue. You can use the playlist feature or add one using \`${guildGateway.get(msg.guild.id, 'prefix')}play\`.`);
            if (!player) {
                joinResult = await this.#join(msg).catch(error => {
                    reply(msg, error.message);
                    return null;
                });
            }
            if (joinResult === null) return null;

            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Queue is empty. The playlist has been added to the queue.`);
            return this.#addToQueue(args, playlist)
                .then(() => {
                    clearTimeout(this.timeouts.get(msg.guild.id));
                    this.timeouts.delete(msg.guild.id);
                    this.#play(msg, playlist[0]);
                })
                .catch(error => reply(msg, error.message));
        }

        const song = await this.#resolveQuery(args, query).catch(error => {
            reply(msg, error.message);
            return null;
        });
        if (song === null) return null;

        this.#prompts.delete(msg.author.id);
        if (Array.isArray(song) && song[0] === null) return reply(msg, song[1]);
        if (!Array.isArray(song) && guildGateway.get(msg.guild.id, 'donation') < 5 && !song.info.isStream && song.info.length > 18_000_000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  **${song.info.title}** is longer than 5 hours. Please donate $5 or more to remove this limit.`); // eslint-disable-line max-len

        clearTimeout(this.timeouts.get(msg.guild.id));
        this.timeouts.delete(msg.guild.id);

        queue = await this.#addToQueue(args, song).catch(error => {
            reply(error.message);
            return null;
        });
        if (queue === null) return null;

        if (!player) {
            joinResult = await this.#join(msg).catch(error => {
                reply(msg, error.message);
                return null;
            });
        }

        if (args.getFlags('force') && queue.length > 1 && player.playing && (await this.container.stores.get('preconditions').get('DJOnly').run(msg)).success) {
            player.stop();
            return reply(msg, `🎵  ::  Forcibly played **${escapeMarkdown(queue[1].info.title)}**.`);
        }

        return this.#play(msg, queue[0]);
    }

    async #join({ guild, channel, member }) {
        if (!member.voice.channel) throw new Error(`${this.container.constants.EMOTES.xmark}  ::  Please do not leave the voice channel.`);

        await this.container.lavacord.join({
            node: this.container.lavacord.idealNodes[0].id,
            guild: guild.id,
            channel: member.voice.channelId
        }, { selfdeaf: true });

        this.container.lavacord.players.get(guild.id).on('error', error => {
            channel.send(`${this.container.constants.EMOTES.xmark}  ::  ${error.error || error.reason || 'An unknown error has occurred.'}`);
            this.container.logger.error(error);
        });
    }

    async #resolveQuery(args, query) {
        const { loadType, tracks, exception } = await this.getSongs(query, query.includes('soundcloud.com') || args.getFlags('soundcloud'));

        switch (loadType) {
            case 'LOAD_FAILED': throw new Error(`${this.container.constants.EMOTES.xmark}  ::  ${exception.message} (Severity: ${exception.severity})`);
            case 'NO_MATCHES': throw new Error(`${this.container.constants.EMOTES.xmark}  ::  No track found for your query.`);
            case 'TRACK_LOADED': return tracks[0];
            case 'PLAYLIST_LOADED':
                if (tracks.length) return tracks;
                throw new Error(`${this.container.constants.EMOTES.xmark}  ::  It seems the playlist is composed of livestreams. Please try adding them individually. Thanks!`);
        }

        // From here on out, loadType === 'SEARCH_RESULT' : true
        const finds = tracks.slice(0, 5);
        this.#prompts.set(args.message.author.id, finds);

        const prompter = new MessagePrompter([
            `🎶  ::  **${escapeMarkdown(args.message.member.displayName)}**, please **reply** the number of the song you want to play: (reply \`cancel\` to cancel prompt)`,
            finds.map((result, index) => {
                const { length } = result.info;
                return `\`${index + 1}\`. **${escapeMarkdown(result.info.title)}** by ${escapeMarkdown(result.info.author)} \`${new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\``;
            }).join('\n')
        ].join('\n'), 'message');
        let limit = 0, choice;
        do {
            if (prompter.strategy.appliedMessage) prompter.strategy.appliedMessage.delete();
            if (limit++ >= 5) {
                this.#prompts.delete(args.message.author.id);
                throw new Error(`${this.container.constants.EMOTES.xmark}  ::  Too many invalid replies. Please try again.`);
            }
            choice = await prompter.run(args.message.channel, args.message.author).catch(() => ({ content: 'cancel' }));
        // eslint-disable-next-line max-len
        } while ((choice.content.toLowerCase() !== 'cancel' && !parseInt(choice.content)) || parseInt(choice.content) < 1 || (this.#prompts.has(args.message.author.id) && parseInt(choice.content) > this.#prompts.get(args.message.author.id).length));
        prompter.strategy.appliedMessage.delete();

        if (choice.deletable) choice.delete();
        if (choice.content.toLowerCase() === 'cancel') {
            this.#prompts.delete(args.message.author.id);
            throw new Error(`${this.container.constants.EMOTES.tick}  ::  Successfully cancelled prompt.`);
        }

        return this.#prompts.get(args.message.author.id)[parseInt(choice.content) - 1];
    }

    async getSongs(query, soundcloud) {
        const node = this.container.lavacord.idealNodes[0];
        const params = new URLSearchParams();

        let isURL = true;
        try {
            new URL(query); // eslint-disable-line no-new
        } catch (err) {
            isURL = false;
        }

        if (isURL) {
            if (SPOTIFY_TRACK_REGEX.test(query)) return { loadType: 'TRACK_LOADED', tracks: [await this.container.spotifyParser.getTrack(SPOTIFY_TRACK_REGEX.exec(query)[1], true)] };
            else if (SPOTIFY_ALBUM_REGEX.test(query)) return { loadType: 'PLAYLIST_LOADED', tracks: await this.container.spotifyParser.getAlbumTracks(SPOTIFY_ALBUM_REGEX.exec(query)[1], true) };
            else if (SPOTIFY_PLAYLIST_REGEX.test(query)) return { loadType: 'PLAYLIST_LOADED', tracks: await this.container.spotifyParser.getPlaylistTracks(SPOTIFY_PLAYLIST_REGEX.exec(query)[1], true) };

            params.set('identifier', query);
            return (await fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, { headers: { Authorization: node.password } })).json();
        }

        params.set('identifier', `${soundcloud ? 'scsearch' : 'ytsearch'}: ${query}`);
        return fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, { headers: { Authorization: node.password } })
            .then(res => res.json())
            .catch(err => {
                this.container.client.emit('wtf', err);
                throw new Error(`${this.container.constants.EMOTES.xmark}  ::  There was an error looking up your query. Please try again.`);
            });
    }

    async #addToQueue(args, song) {
        const { queue } = this.container.stores.get('gateways').get('musicGateway').get(args.message.guild.id);
        const player = this.container.lavacord.players.get(args.message.guild.id);
        const guildGateway = this.container.stores.get('gateways').get('guildGateway');

        if (args.getFlags('force') && (await this.container.stores.get('preconditions').get('DJOnly').run(args.message)).success) {
            const songs = Array.isArray(song) ? song.map(track => mergeObjects(track, { requester: args.message.author.id, incognito: args.getFlags('incognito') })) : [mergeObjects(song, { requester: args.message.author.id, incognito: args.getFlags('incognito') })]; // eslint-disable-line max-len

            if (player && player.playing) queue.splice(1, 0, ...songs);
            else queue.splice(0, 1, ...songs);
        } else if (Array.isArray(song)) {
            let songCount = 0;

            for (const track of song) {
                if (track === null) continue;
                if (queue.length >= guildGateway.get(args.message.guild.id, 'music.maxQueue')) break;
                if (queue.filter(request => request.requester === args.message.author.id).length >= guildGateway.get(args.message.guild.id, 'music.maxUserRequests')) break;
                if (guildGateway.get(args.message.guild.id, 'music.noDuplicates') && queue.some(request => request.track === track.track)) continue;
                if (guildGateway.get(args.message.guild.id, 'donation') < 5 && track.info.length > 18_000_000) continue;

                queue.push(mergeObjects(track, { requester: args.message.author.id, incognito: args.getFlags('incognito') }));
                songCount++;
            }

            reply(args.message, `🎶  ::  **${songCount} song${songCount === 1 ? '' : 's'}** ha${songCount === 1 ? 's' : 've'} been added to the queue, now at **${queue.length - 1}** entries.`);
            if (songCount < song.length) args.message.reply(`⚠  ::  Not all songs were added. Possibilities: (1) You've reached the queue limit of ${guildGateway.get(args.message.guild.id, 'music.maxQueue')} songs, (2) all songs longer than 5 hours weren't added, (3) there were duplicates, (4) you've reached the limit of ${guildGateway.get(args.message.guild.id, 'music.maxUserRequests')} song requests per user, or (5) a YouTube equivalent of a Spotify track was not found. View limits via \`${guildGateway.get(args.message.guild.id, 'prefix')}conf show music\`.`); // eslint-disable-line max-len
        } else {
            if (queue.length >= guildGateway.get(args.message.guild.id, 'music.maxQueue')) throw new Error(`${this.container.constants.EMOTES.xmark}  ::  The music queue for **${args.message.guild.name}** has reached the limit of ${args.message.guild.settings.get('music.maxQueue')} songs; currently ${queue.length}. Change limit via \`${guildGateway.get(args.message.guild.id, 'prefix')}conf set music.maxQueue <new limit>\`.`); // eslint-disable-line max-len
            if (queue.filter(request => request.requester === args.message.author.id).length >= guildGateway.get(args.message.guild.id, 'music.maxUserRequests')) throw new Error(`${this.container.constants.EMOTES.xmark}  ::  You've reached the maximum request per user limit of ${guildGateway.get(args.message.guild.id, 'music.maxUserRequests')} requests. Change limit via \`${guildGateway.get(args.message.guild.id, 'prefix')}conf set music.maxUserRequests <new limit>\`.`); // eslint-disable-line max-len
            if (guildGateway.get(args.message.guild.id, 'music.noDuplicates') && queue.filter(request => request.track === song.track).length) throw new Error(`${this.container.constants.EMOTES.xmark}  ::  This song is already in the queue, and duplicates are disabled in this server. Disable via \`${guildGateway.get(args.message.guild.id, 'prefix')}conf set music.noDuplicates false\`.`); // eslint-disable-line max-len

            queue.push(mergeObjects(song, { requester: args.message.author.id, incognito: args.getFlags('incognito') }));

            if (!args.message.channel.permissionsFor(this.container.client.user).has('EMBED_LINKS')) {
                reply(args.message, `🎶  ::  **${song.info.title}** has been added to the queue to position \`${queue.length === 1 ? 'Now Playing' : `#${queue.length - 1}`}\`. For various music settings, run \`${guildGateway.get(args.message.guild.id, 'prefix')}conf show music\`. Change settings with \`set\` instead of \`show\`.`); // eslint-disable-line max-len
            } else {
                const { title, length, uri, author, isStream } = queue[queue.length - 1].info;
                const duration = queue.reduce((prev, current) => prev + (current.info.isStream ? 0 : current.info.length), 0) - (queue[queue.length - 1].info.isStream ? 0 : queue[queue.length - 1].info.length) - (player && player.playing && !queue[0].info.isStream ? player.state.position : 0); // eslint-disable-line max-len
                reply(args.message, { content: queue.length >= 2 && (!player || !player.playing) ?
                    // eslint-disable-next-line max-len
                    `🔢  ::  There are songs in your queue from your previous session! You can run ${queue.length >= 3 ? `\`${guildGateway.get(args.message.guild.id, 'prefix')}remove 1${queue.length >= 4 ? `-${queue.length - 2}` : ''}\` then ` : ' '}\`${guildGateway.get(args.message.guild.id, 'prefix')}skip\` to start over.` :
                    `${this.container.constants.EMOTES.tick}  ::  Successfully added your song to the queue!`, embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setAuthor({ name: `Enqueued by ${args.message.member.displayName} (${args.message.author.tag})`, iconURL: args.message.author.displayAvatarURL({ dynamic: true }) })
                    .setTitle(title)
                    .setURL(uri)
                    .setDescription(`by ${author}`)
                    // eslint-disable-next-line max-len
                    .setFooter({ text: `For various music settings, run \`${guildGateway.get(args.message.guild.id, 'prefix')}conf show music\`. Change settings with \`set\` instead of \`show\`.\n\nIf the bot starts to sound robotic, please check if your internet connection is experiencing packet loss.` })
                    .addField('Queue Position', queue.length === 1 ? 'Now Playing' : String(queue.length - 1), true)
                    .addField('Duration', isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length), true)
                    .addField('Time Left Before Playing', new Timestamp(`${duration >= 86400000 ? 'DD:' : ''}${duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(duration), true)] });
            }
        }
        await this.container.stores.get('gateways').get('musicGateway').update(args.message.guild.id, { queue });
        return queue;
    }

    async #play({ guild, channel }, song) {
        const player = this.container.lavacord.players.get(guild.id);
        if (player.playing) return;

        const guildGateway = this.container.stores.get('gateways').get('guildGateway');
        const volume = guildGateway.get(guild.id, 'music.volume');
        // { volume: volume === 100 ? undefined : volume }
        player.play(song.track);
        if (volume !== 100) player.volume(volume);
        // the above two lines are temporary until in-op volume is fixed
        this.container.cache.guilds.get(guild.id).clearVoteskips();
        player.once('end', async data => {
            if (data.reason === 'REPLACED') return null;

            const { queue } = this.container.stores.get('gateways').get('musicGateway').get(guild.id);

            let previous;
            if (guildGateway.get(guild.id, 'music.repeat') === 'queue') queue.push(queue[0]);
            if (guildGateway.get(guild.id, 'music.repeat') !== 'song') previous = queue.shift();
            if (guildGateway.get(guild.id, 'donation') >= 8 && guildGateway.get(guild.id, 'music.autoplay') && !queue.length) {
                const params = new URLSearchParams();
                params.set('part', 'snippet');
                params.set('relatedToVideoId', previous.info.identifier);
                params.set('type', 'video');
                params.set('key', process.env.GOOGLE_API_KEY); // eslint-disable-line no-process-env
                const { items } = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`).then(res => res.json());
                if (items && items.length) {
                    const relatedVideo = items[Math.floor(Math.random() * items.length)];
                    const songResult = relatedVideo ? await this.getSongs(`https://youtu.be/${relatedVideo.id.videoId}`, false).catch(error => {
                        channel.send(error.message);
                        return null;
                    }) : null;

                    if (songResult) queue.push(mergeObjects(songResult.tracks[0], { requester: this.container.client.user.id, incognito: false }));
                }
            }

            await this.container.stores.get('gateways').get('musicGateway').update(guild.id, { queue });
            if (queue.length) return this.#play({ guild, channel }, queue[0]);

            if (guildGateway.get(guild.id, 'donation') < 10) {
                this.timeouts.set(guild.id, setTimeout(((guildID) => {
                    this.container.lavacord.leave(guildID);
                    clearTimeout(this.timeouts.get(guildID));
                    this.timeouts.delete(guildID);
                }).bind(this), 1000 * 60 * 5, guild.id));
            }
            return channel.send(`👋  ::  No song left in the queue, so the music session has ended! Play more music with \`${guildGateway.get(guild.id, 'prefix')}play <song search>\`!`);
        });

        if (guildGateway.get(guild.id, 'donation') >= 3 && !song.incognito) {
            const { history } = this.container.stores.get('gateways').get('musicGateway').get(guild.id);
            history.unshift(mergeObjects(song, { timestamp: Date.now() }));
            this.container.stores.get('gateways').get('musicGateway').update(guild.id, { history });
        }

        const announceChannel = guild.channels.cache.get(guildGateway.get(guild.id, 'music.announceChannel')) || channel;
        if (guildGateway.get(guild.id, 'music.announceSongs') && announceChannel.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) announceChannel.send(`🎧  ::  Now Playing: **${escapeMarkdown(song.info.title)}** by ${escapeMarkdown(song.info.author)} (Requested by **${escapeMarkdown(await guild.members.fetch(song.requester).then(req => req.displayName).catch(() => this.container.client.users.fetch(song.requester).then(user => user.tag)))}** - more info on \`${guildGateway.get(guild.id, 'prefix')}np\`).`); // eslint-disable-line max-len
    }

};
