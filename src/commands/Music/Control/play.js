const { Command, CommandOptionsRunTypeEnum, Timestamp, util: { mergeObjects } } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');
const { parse } = require('url');

const prompts = new Map();
const timeouts = new Map();

const SPOTIFY_TRACK_REGEX = /https?:\/\/open\.spotify\.com\/track\/([a-z0-9-_]+)/i;
const SPOTIFY_ALBUM_REGEX = /https?:\/\/open\.spotify\.com\/album\/([a-z0-9-_]+)/i;
const SPOTIFY_PLAYLIST_REGEX = /https?:\/\/open\.spotify\.com\/playlist\/([a-z0-9-_]+)/i;

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['p'],
            permissionLevel: 5,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Plays music in the server. Accepts YouTube, Spotify, SoundCloud, Vimeo, Mixer, Bandcamp, Twitch, and online radios.',
            extendedHelp: [
                'You can limit the voice channels Stalwartle can connect to for music: `s.conf set music.limitToChannel <channel ID>`.',
                'To continue playing from the current music queue (if stopped), simply do not supply any argument.',
                'To choose which channel I will announce songs, use `s.conf set music.announceChannel <channel>`.',
                'Use SoundCloud with your searches just by simply using the `--soundcloud` flag! e.g. `s.play Imagine Dragons - Natural --soundcloud`',
                'To force play a song, just use the `--force` flag. e.g. `s.play twenty one pilots - Jumpsuit --force`.',
                '\nTo insert a whole YouTube playlist into the queue, just supply the playlist link.',
                'To play directly from Vimeo, Mixer (Beam.pro), Bandcamp, or Twitch, give the video/song/stream\'s link. (or for bandcamp, song/album)',
                'To play an online radio, simply supply the radio link.',
                'To enable autoplay, use `s.conf set music.autoplay true`. This is only applicable for $8+ donators.'
            ],
            usage: '[TracksURL:url|Query:string]'
        });
    }

    async messageRun(msg, [query]) {
        if (msg.guild.player && !msg.guild.me.voice.channel) await this.container.client.playerManager.leave(msg.guild.id);
        if (!msg.member.voice.channel) throw `${this.container.constants.EMOTES.xmark}  ::  Please connect to a voice channel first.`;
        if (msg.guild.settings.get('music.limitToChannel').length && !msg.guild.settings.get('music.limitToChannel').includes(msg.member.voice.channelID)) {
            throw `${this.container.constants.EMOTES.xmark}  ::  Your current voice channel is not included in this server's music channels.`;
        }
        if (!msg.member.voice.channel.permissionsFor(this.container.client.user).has(['CONNECT', 'SPEAK', 'VIEW_CHANNEL'])) throw `${this.container.constants.EMOTES.xmark}  ::  I do not have the required permissions (**Connect**, **Speak**, **View Channel**) to play music in #**${msg.member.voice.channel.name}**.`; // eslint-disable-line max-len
        if (prompts.has(msg.author.id)) throw `${this.container.constants.EMOTES.xmark}  ::  You are currently being prompted. Please pick one first or cancel the prompt.`;

        let queue, playlist;
        try {
            ({ queue = [], playlist = [] } = await this.container.databases.default.get('music', msg.guild.id) || {}); // eslint-disable-line prefer-const
        } catch (err) {
            this.container.client.emit('wtf', err);
            throw `${this.container.constants.EMOTES.xmark}  ::  An unknown error occured. Please try again.`;
        }

        if (!query) {
            if (msg.guild.player && msg.guild.player.playing) throw `${this.container.constants.EMOTES.xmark}  ::  Music is playing in this server, however you can still enqueue a song. You can stop the music session using the \`${msg.guild.settings.get('prefix')}leave\` or \`${msg.guild.settings.get('prefix')}stop\` command.`; // eslint-disable-line max-len
            if (queue.length) {
                msg.send('🎶  ::  No search query provided, but I found tracks in the queue so I\'m gonna play it.');
                await this.join(msg);
                return this.play(msg, queue[0]);
            }
            // eslint-disable-next-line max-len
            if (!playlist.length) throw `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the queue. You can use the playlist feature or add one using \`${msg.guild.settings.get('prefix')}play\``;
            if (!msg.guild.player) await this.join(msg);
            msg.send(`${this.container.constants.EMOTES.tick}  ::  Queue is empty. The playlist has been added to the queue.`);
            await this.addToQueue(msg, playlist).catch(err => {
                this.container.client.emit('wtf', err);
                throw `${this.container.constants.EMOTES.xmark}  ::  There was an error loading your playlist to the queue. Please try again.`;
            });
            clearTimeout(timeouts.get(msg.guild.id));
            timeouts.delete(msg.guild.id);
            return this.play(msg, playlist[0]);
        }

        const song = await this.resolveQuery(msg, query);
        prompts.delete(msg.author.id);
        if (!Array.isArray(song) && msg.guild.settings.get('donation') < 5 && !song.info.isStream && song.info.length > 18000000) throw `${this.container.constants.EMOTES.xmark}  ::  **${song.info.title}** is longer than 5 hours. Please donate $5 or more to remove this limit.`; // eslint-disable-line max-len

        clearTimeout(timeouts.get(msg.guild.id));
        timeouts.delete(msg.guild.id);

        queue = await this.addToQueue(msg, song).catch(err => {
            if (typeof err === 'string') throw err;
            this.container.client.emit('wtf', err);
            throw `${this.container.constants.EMOTES.xmark}  ::  There was an error adding your song to the queue. Please \`${msg.guild.settings.get('prefix')}clear\` the queue and try again. If issue persists, please submit a bug report. Thanks!`; // eslint-disable-line max-len
        });

        if (!msg.guild.player) await this.join(msg);

        if (msg.flagArgs.force && queue.length > 1 && msg.guild.player.playing && await msg.hasAtLeastPermissionLevel(5)) {
            msg.send(`🎵  ::  Forcibly played **${escapeMarkdown(queue[1].info.title)}**.`);
            return msg.guild.player.stop();
        }

        return this.play(msg, queue[0]);
    }

    async join({ guild, channel, member }) {
        if (!member.voice.channel) throw `${this.container.constants.EMOTES.xmark}  ::  Please do not leave the voice channel.`;

        await this.container.client.playerManager.join({
            node: this.container.client.playerManager.idealNodes[0].id,
            guild: guild.id,
            channel: member.voice.channelID
        }, { selfdeaf: true });

        guild.player.on('error', error => {
            channel.send(`${this.container.constants.EMOTES.xmark}  ::  ${error.error || error.reason || 'An unknown error has occurred.'}`);
            this.container.client.emit('wtf', error);
        });
    }

    async resolveQuery(msg, query) {
        const { loadType, tracks, exception } = await this.getSongs(query, query.includes('soundcloud.com') || Boolean(msg.flagArgs.soundcloud));

        switch (loadType) {
            case 'LOAD_FAILED': throw `${this.container.constants.EMOTES.xmark}  ::  ${exception.message} (Severity: ${exception.severity})`;
            case 'NO_MATCHES': throw `${this.container.constants.EMOTES.xmark}  ::  No track found for your query.`;
            case 'TRACK_LOADED': return tracks[0];
            case 'PLAYLIST_LOADED':
                if (tracks.length) return tracks;
                else throw `${this.container.constants.EMOTES.xmark}  ::  It seems the playlist is composed of livestreams. Please try adding them individually. Thanks!`;
        }

        // From here on out, loadType === 'SEARCH_RESULT' : true
        const finds = tracks.slice(0, 5);
        prompts.set(msg.author.id, finds);

        let limit = 0, choice;
        do {
            if (limit++ >= 5) {
                prompts.delete(msg.author.id);
                throw `${this.container.constants.EMOTES.xmark}  ::  Too many invalid replies. Please try again.`;
            }
            choice = await msg.prompt([
                `🎶  ::  **${escapeMarkdown(msg.member.displayName)}**, please **reply** the number of the song you want to play: (reply \`cancel\` to cancel prompt)`,
                finds.map((result, index) => {
                    const { length } = result.info;
                    return `\`${index + 1}\`. **${escapeMarkdown(result.info.title)}** by ${escapeMarkdown(result.info.author)} \`${new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\``; // eslint-disable-line max-len
                }).join('\n')
            ].join('\n')).catch(() => ({ content: 'cancel' }));
        // eslint-disable-next-line max-len
        } while ((choice.content.toLowerCase() !== 'cancel' && !parseInt(choice.content)) || parseInt(choice.content) < 1 || (prompts.has(msg.author.id) && parseInt(choice.content) > prompts.get(msg.author.id).length));

        if (msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES') && choice.delete) choice.delete();
        if (choice.content.toLowerCase() === 'cancel') {
            prompts.delete(msg.author.id);
            throw `${this.container.constants.EMOTES.tick}  ::  Successfully cancelled prompt.`;
        }

        return prompts.get(msg.author.id)[parseInt(choice.content) - 1];
    }

    async getSongs(query, soundcloud) {
        const node = this.container.client.playerManager.idealNodes[0];
        const params = new URLSearchParams();

        if (parse(query).protocol && parse(query).hostname) {
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
                throw `${this.container.constants.EMOTES.xmark}  ::  There was an error looking up your query. Please try again.`;
            });
    }

    async addToQueue(msg, song) {
        const { queue = [] } = await this.container.databases.default.get('music', msg.guild.id) || {};

        if (msg.flagArgs.force && await msg.hasAtLeastPermissionLevel(5)) {
            const songs = Array.isArray(song) ? song.map(track => mergeObjects(track, { requester: msg.author.id, incognito: Boolean(msg.flagArgs.incognito) })) : [mergeObjects(song, { requester: msg.author.id, incognito: Boolean(msg.flagArgs.incognito) })]; // eslint-disable-line max-len

            if (msg.guild.player && msg.guild.player.playing) queue.splice(1, 0, ...songs);
            else queue.splice(0, 1, ...songs);
        } else if (Array.isArray(song)) {
            let songCount = 0;

            for (const track of song) {
                if (track === null) continue;
                if (queue.length >= msg.guild.settings.get('music.maxQueue')) break;
                if (queue.filter(request => request.requester === msg.author.id).length >= msg.guild.settings.get('music.maxUserRequests')) break;
                if (msg.guild.settings.get('music.noDuplicates') && queue.some(request => request.track === track.track)) continue;
                if (msg.guild.settings.get('donation') < 5 && track.info.length > 18000000) continue;

                queue.push(mergeObjects(track, { requester: msg.author.id, incognito: Boolean(msg.flagArgs.incognito) }));
                songCount++;
            }

            msg.send(`🎶  ::  **${songCount} song${songCount === 1 ? '' : 's'}** ha${songCount === 1 ? 's' : 've'} been added to the queue, now at **${queue.length - 1}** entries.`);
            if (songCount < song.length) msg.channel.send(`⚠  ::  Not all songs were added. Possibilities: (1) You've reached the queue limit of ${msg.guild.settings.get('music.maxQueue')} songs, (2) all songs longer than 5 hours weren't added, (3) there were duplicates, (4) you've reached the limit of ${msg.guild.settings.get('music.maxUserRequests')} song requests per user, or (5) a YouTube equivalent of a Spotify track was not found. View limits via \`${msg.guild.settings.get('prefix')}conf show music\`.`); // eslint-disable-line max-len
        } else {
            if (queue.length >= msg.guild.settings.get('music.maxQueue')) throw `${this.container.constants.EMOTES.xmark}  ::  The music queue for **${msg.guild.name}** has reached the limit of ${msg.guild.settings.get('music.maxQueue')} songs; currently ${queue.length}. Change limit via \`${msg.guild.settings.get('prefix')}conf set music.maxQueue <new limit>\`.`; // eslint-disable-line max-len
            if (queue.filter(request => request.requester === msg.author.id).length >= msg.guild.settings.get('music.maxUserRequests')) throw `${this.container.constants.EMOTES.xmark}  ::  You've reached the maximum request per user limit of ${msg.guild.settings.get('music.maxUserRequests')} requests. Change limit via \`${msg.guild.settings.get('prefix')}conf set music.maxUserRequests <new limit>\`.`; // eslint-disable-line max-len
            if (msg.guild.settings.get('music.noDuplicates') && queue.filter(request => request.track === song.track).length) throw `${this.container.constants.EMOTES.xmark}  ::  This song is already in the queue, and duplicates are disabled in this server. Disable via \`${msg.guild.settings.get('prefix')}conf set music.noDuplicates false\`.`; // eslint-disable-line max-len

            queue.push(mergeObjects(song, { requester: msg.author.id, incognito: Boolean(msg.flagArgs.incognito) }));

            if (!msg.channel.permissionsFor(this.container.client.user).has('EMBED_LINKS')) {
                msg.send(`🎶  ::  **${song.info.title}** has been added to the queue to position \`${queue.length === 1 ? 'Now Playing' : `#${queue.length - 1}`}\`. For various music settings, run \`${msg.guild.settings.get('prefix')}conf show music\`. Change settings with \`set\` instead of \`show\`.`); // eslint-disable-line max-len
            } else {
                const { title, length, uri, author, isStream } = queue[queue.length - 1].info;
                const duration = queue.reduce((prev, current) => prev + (current.info.isStream ? 0 : current.info.length), 0) - (queue[queue.length - 1].info.isStream ? 0 : queue[queue.length - 1].info.length) - (msg.guild.player && msg.guild.player.playing && !queue[0].info.isStream ? msg.guild.player.state.position : 0); // eslint-disable-line max-len
                reply(msg, { content: queue.length >= 2 && (!msg.guild.player || (msg.guild.player && !msg.guild.player.playing)) ?
                    // eslint-disable-next-line max-len
                    `🔢  ::  There are songs in your queue from your previous session! You can run ${queue.length >= 3 ? `\`${msg.guild.settings.get('prefix')}remove 1${queue.length >= 4 ? `-${queue.length - 2}` : ''}\` then ` : ' '}\`${msg.guild.settings.get('prefix')}skip\` to start over.` :
                    '', embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setAuthor({ name: `Enqueued by ${msg.member.displayName} (${msg.author.tag})`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                    .setTitle(title)
                    .setURL(uri)
                    .setDescription(`by ${author}`)
                    // eslint-disable-next-line max-len
                    .setFooter({ text: `For various music settings, run \`${msg.guild.settings.get('prefix')}conf show music\`. Change settings with \`set\` instead of \`show\`.\n\nIf the bot starts to sound robotic, please check if your internet connection is experiencing packet loss.` })
                    .addField('Queue Position', queue.length === 1 ? 'Now Playing' : queue.length - 1, true)
                    .addField('Duration', isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length), true)
                    .addField('Time Left Before Playing', new Timestamp(`${duration >= 86400000 ? 'DD:' : ''}${duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(duration), true)] });
            }
        }
        await this.container.databases.default.update('music', msg.guild.id, { queue }, true);
        return queue;
    }

    async play({ guild, channel }, song) {
        if (guild.player.playing) return;

        const volume = guild.settings.get('music.volume');
        // { volume: volume === 100 ? undefined : volume }
        guild.player.play(song.track);
        if (volume !== 100) guild.player.volume(volume);
        // the above two lines are temporary until in-op volume is fixed
        guild.clearVoteskips();
        guild.player.once('end', async data => {
            if (data.reason === 'REPLACED') return null;

            const { queue = [] } = await this.container.databases.default.get('music', guild.id) || {};

            let previous;
            if (guild.settings.get('music.repeat') === 'queue') queue.push(queue[0]);
            if (guild.settings.get('music.repeat') !== 'song') previous = queue.shift();
            if (guild.settings.get('donation') >= 8 && guild.settings.get('music.autoplay') && !queue.length) {
                const params = new URLSearchParams();
                params.set('part', 'snippet');
                params.set('relatedToVideoId', previous.info.identifier);
                params.set('type', 'video');
                params.set('key', this.container.auth.googleAPIkey);
                const { items } = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`).then(res => res.json());
                if (items && items.length) {
                    const relatedVideo = items[Math.floor(Math.random() * items.length)];
                    if (relatedVideo) queue.push(mergeObjects((await this.getSongs(`https://youtu.be/${relatedVideo.id.videoId}`, false)).tracks[0], { requester: this.container.client.user.id, incognito: false })); // eslint-disable-line max-len
                }
            }

            await this.container.databases.default.update('music', guild.id, { queue });
            if (queue.length) return this.play({ guild, channel }, queue[0]);

            if (guild.settings.get('donation') < 10) {
                timeouts.set(guild.id, setTimeout(((guildID) => {
                    this.container.client.playerManager.leave(guildID);
                    clearTimeout(timeouts.get(guildID));
                    timeouts.delete(guildID);
                }).bind(this), 1000 * 60 * 5, guild.id));
            }
            return channel.send(`👋  ::  No song left in the queue, so the music session has ended! Play more music with \`${guild.settings.get('prefix')}play <song search>\`!`);
        });

        if (guild.settings.get('donation') >= 3 && !song.incognito) {
            const { history = [] } = await this.container.databases.default.get('music', guild.id) || {};
            history.unshift(mergeObjects(song, { timestamp: Date.now() }));
            this.container.databases.default.update('music', guild.id, { history });
        }

        const announceChannel = guild.channels.cache.get(guild.settings.get('music.announceChannel')) || channel;
        if (guild.settings.get('music.announceSongs') && announceChannel.postable) announceChannel.send(`🎧  ::  Now Playing: **${escapeMarkdown(song.info.title)}** by ${escapeMarkdown(song.info.author)} (Requested by **${escapeMarkdown(await guild.members.fetch(song.requester).then(req => req.displayName).catch(() => this.container.client.users.fetch(song.requester).then(user => user.tag)))}** - more info on \`${guild.settings.get('prefix')}np\`)`); // eslint-disable-line max-len
    }

    async init() {
        const defProvider = this.container.databases.default;
        if (!await defProvider.hasTable('music')) defProvider.createTable('music');
    }

    get timeouts() {
        return timeouts;
    }

};
