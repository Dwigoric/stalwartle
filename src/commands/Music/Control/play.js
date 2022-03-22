const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Timestamp } = require('@sapphire/time-utilities');
const { mergeObjects } = require('@sapphire/utilities');
const { Util: { escapeMarkdown }, MessageEmbed } = require('discord.js');
const { TrackUtils: { buildUnresolved } } = require('erela.js');

require('dotenv').config();

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['p'],
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Plays music in the server. Accepts YouTube, Spotify, SoundCloud, Vimeo, Mixer, Bandcamp, Twitch, and online radios.',
            flags: ['force', 'soundcloud', 'next'],
            detailedDescription: [
                'You can limit the voice channels Stalwartle can connect to for music: `s.conf set music.limitToChannel <channel ID>`.',
                'To continue playing from the current music queue (if stopped), simply do not supply any argument.',
                'To choose which channel I will announce songs, use `s.conf set music.announceChannel <channel>`.',
                'Use SoundCloud with your searches just by simply using the `--soundcloud` flag! e.g. `s.play Imagine Dragons - Natural --soundcloud`',
                'To force play a song, just use the `--force` flag. e.g. `s.play twenty one pilots - Jumpsuit --force`.',
                'To move song(s) to the front of the queue, use the `--next` flag.',
                '\nTo insert a whole YouTube playlist into the queue, just supply the playlist link.',
                'To play directly from Vimeo, Mixer (Beam.pro), Bandcamp, or Twitch, give the video/song/stream\'s link. (or for bandcamp, song/album)',
                'To play an online radio, simply supply the radio link.',
                'To enable autoplay, use `s.conf set music.autoplay true`. This is only applicable for $8+ donators.'
            ].join('\n')
        });
        this.usage = '[TracksURL:url|Query:string]';
        Object.defineProperty(this, 'timeouts', { value: new Map(), writable: false });
    }

    #prompts = new Map();

    async messageRun(msg, args) {
        const query = await args.pick('url').catch(() => args.rest('string').catch(() => null));

        let player = this.container.erela.players.get(msg.guild.id);

        if (!msg.member.voice.channel) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please connect to a voice channel first.`);

        const guildGateway = this.container.stores.get('gateways').get('guildGateway');
        if (guildGateway.get(msg.guild.id, 'music.limitToChannel').length && !guildGateway.get(msg.guild.id, 'music.limitToChannel').includes(msg.member.voice.channelId)) {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Your current voice channel is not included in this server's music channels.`);
        }
        if (!msg.member.voice.channel.permissionsFor(this.container.client.user).has(['CONNECT', 'SPEAK', 'VIEW_CHANNEL'])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I do not have the required permissions (**Connect**, **Speak**, **View Channel**) to play music in <#${msg.member.voice.channelId}>.`); // eslint-disable-line max-len
        if (this.#prompts.has(msg.author.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You are currently being prompted. Please pick one first or cancel the prompt.`);

        const { queue, playlist } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);

        if (!query) {
            // eslint-disable-next-line max-len
            if (player && player.playing) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Music is playing in this server, however you can still enqueue a song. You can stop the music session using the \`${guildGateway.get(msg.guild.id, 'prefix')}leave\` or \`${guildGateway.get(msg.guild.id, 'prefix')}stop\` command.`);
            player = this.#createPlayer(msg);

            if (queue.length) {
                reply(msg, '🎶  ::  No search query provided, but I found tracks in the queue so I\'m gonna play it.');
                if (player.state === 'DISCONNECTED') player.connect();

                return this.#play(msg, queue, { incognito: args.getFlags('incognito'), resolved: false });
            }

            if (!playlist.length) {
                player.destroy();
                return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the queue. You can use the playlist feature or add one using \`${guildGateway.get(msg.guild.id, 'prefix')}play\`.`);
            }
            if (player.state === 'DISCONNECTED') player.connect();

            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Queue is empty. The playlist has been added to the queue.`);
            return this.#play(msg, playlist, { incognito: args.getFlags('incognito'), resolved: false });
        }

        player = this.#createPlayer(msg);

        const song = await this.#resolveQuery(args, query).catch(error => {
            reply(msg, error.message);
            return null;
        });
        if (song === null) return null;

        this.#prompts.delete(msg.author.id);
        // eslint-disable-next-line max-len
        if (!Array.isArray(song) && guildGateway.get(msg.guild.id).donation < 5 && !song.isStream && song.duration > 18_000_000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  **${song.info.title}** is longer than 5 hours. Please donate $5 or more to remove this limit.`);

        clearTimeout(this.timeouts.get(msg.guild.id));
        this.timeouts.delete(msg.guild.id);

        if (player.state === 'DISCONNECTED') player.connect();
        if (args.getFlags('force', 'next') && (await this.container.stores.get('preconditions').get('DJOnly').run(msg)).success) {
            return this.#play(msg, song, {
                incognito: args.getFlags('incognito'),
                next: args.getFlags('next'),
                force: args.getFlags('force')
            });
        }
        return this.#play(msg, song, { incognito: args.getFlags('incognito') });
    }

    #createPlayer({ guild, member, channel }) {
        const { music } = this.container.stores.get('gateways').get('guildGateway').get(guild.id);

        return this.container.erela.create({
            guild: guild.id,
            node: this.container.erela.nodes.first().options.identifier,
            selfDeafen: true,
            textChannel: music.announceChannel || channel.id,
            voiceChannel: member.voice.channelId,
            volume: music.volume
        });
    }

    async #play(msg, song, { force = false, next = false, incognito = false, resolved = true } = {}) {
        const player = this.container.erela.players.get(msg.guild.id);
        const { music } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);

        if (player.queue.totalSize >= music.maxQueue) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  This server has reached its set maximum queue entries!`);

        await this.#addToQueue(msg, resolved ? song : Array.isArray(song) ? song.map(track => buildUnresolved(track)) : buildUnresolved(song), { force, next, incognito });

        switch (music.repeat) {
            case 'queue': player.setQueueRepeat(true); break;
            case 'song': player.setTrackRepeat(true);
        }

        if (force) return player.stop();
        if (!player.playing && !player.paused) return player.play();
        return null;
    }

    async #resolveQuery(args, query) {
        const { exception, loadType, playlist, tracks } = await this.container.erela.search(
            query instanceof URL ?
                query.toString() :
                {
                    query,
                    source: args.getFlags('soundcloud') ? 'soundcloud' : 'youtube'
                },
            args.message.author.id
        );

        const player = this.container.erela.players.get(args.message.guild.id);
        switch (loadType) {
            case 'LOAD_FAILED': throw new Error(`${this.container.constants.EMOTES.xmark}  ::  ${exception.message} (Severity: ${exception.severity})`);
            case 'NO_MATCHES': throw new Error(`${this.container.constants.EMOTES.xmark}  ::  No track found for your query.`);
            case 'TRACK_LOADED': return tracks[0];
            case 'PLAYLIST_LOADED':
                if (tracks.length) {
                    const channel = this.container.client.channels.cache.get(player.textChannel);
                    channel.send(`${this.container.constants.EMOTES.tick}  ::  Group of tracks loaded: **${escapeMarkdown(playlist.name)}**.`);
                    return tracks;
                }
                throw new Error(`${this.container.constants.EMOTES.xmark}  ::  It seems the playlist is composed of livestreams. Please try adding them individually.`);
        }

        const finds = tracks.slice(0, 5);
        this.#prompts.set(args.message.author.id, finds);

        const prompter = new MessagePrompter([
            `🎶  ::  **${escapeMarkdown(args.message.member.displayName)}**, please **reply** the number of the song you want to play: (reply \`cancel\` to cancel prompt)`,
            // eslint-disable-next-line max-len
            finds.map((result, index) => `\`${index + 1}\`. **${escapeMarkdown(result.title)}** by ${escapeMarkdown(result.author)} \`${new Timestamp(`${result.duration >= 86400000 ? 'DD:' : ''}${result.duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(result.duration)}\``).join('\n')
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

    async #addToQueue(msg, song, { force, next, incognito }) {
        const player = this.container.erela.players.get(msg.guild.id);
        const { queue } = player;
        const { music, donation, prefix } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);

        if (force || next) {
            const songs = Array.isArray(song) ? song.map(track => mergeObjects(track, { incognito })) : [mergeObjects(song, { incognito })];

            queue.splice(0, 0, ...songs);
            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully moved **${songs.length > 1 ? `${songs.length} songs` : songs[0].title}** to the front of the queue.`);
        } else if (Array.isArray(song)) {
            const { length } = song;

            if (donation < 5) song = song.filter(track => track.duration <= 18_000_000);
            if (music.noDuplicates) song = song.filter(trackToAdd => queue.some(track => track.track !== trackToAdd.track));
            if (song.length + player.queue.filter(track => track.requester === msg.author.id).length > music.maxUserRequests) song.splice(music.maxUserRequests - player.queue.filter(track => track.requester === msg.author.id).length - 1);
            if (player.queue.length + song.length > music.maxQueue) song.splice(music.maxQueue - player.queue.length - 1);

            queue.add(song.map(track => mergeObjects(track, { incognito })));

            // eslint-disable-next-line max-len
            if (song.length < length) reply(msg, `⚠  ::  Not all songs were added. Possibilities: (1) You've reached the queue limit of ${music.maxQueue} songs, (2) all songs longer than 5 hours weren't added, (3) there were duplicates, (4) you've reached the limit of ${music.maxUserRequests} song requests per user, or (5) a YouTube equivalent of a Spotify track was not found. Server moderators and managers can view the limits using the \`conf\` command.`);
            reply(msg, `${this.container.constants.EMOTES.tick}  ::  **${song.length} song${song.length === 1 ? '' : 's'}** ha${song.length === 1 ? 's' : 've'} been added to the queue, now at **${queue.length} entries**.`);
        } else {
            if (donation < 5 && song.duration > 18_000_000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  This song is longer than 5 hours!`);
            // eslint-disable-next-line max-len
            if (queue.filter(track => track.requester === msg.author.id).length >= music.maxUserRequests) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You've reached the maximum user request limit on this server of ${music.maxUserRequests} requests. Moderators and managers can change the limit via the \`conf\` command.`);
            if (music.noDuplicates && queue.some(track => track.track === song.track)) return reply(`${this.container.constants.EMOTES.xmark}  ::  It looks like this song is already enqueued! This server disabled duplicate requests.`);

            queue.add(mergeObjects(song, { incognito }));

            if (this.container.client.channels.cache.get(player.textChannel).permissionsFor(this.container.client.user).has('EMBED_LINKS')) {
                const duration = queue.reduce((prev, current) => prev + (current.isStream ? 0 : current.duration), 0) -
                    song.duration +
                    (player.playing && player.queue.current.isStream ? 0 : player.queue.current.duration) -
                    (player.playing && player.queue.current.isStream ? 0 : player.position);
                reply(msg, {
                    content: queue.length >= 2 && (!player || !player.playing) ?
                        `🔢  ::  There are songs in your queue from your previous session! You can run ${queue.length >= 3 ? `\`${prefix}remove 1${queue.length >= 4 ? `-${queue.length - 2}` : ''}\` then ` : ' '}\`${prefix}skip\` to start over.` :
                        `${this.container.constants.EMOTES.tick}  ::  Successfully added your song to the queue!`,
                    embeds: [new MessageEmbed()
                        .setColor('RANDOM')
                        .setAuthor({ name: `Enqueued by ${msg.member.displayName} (${msg.author.tag})`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                        .setTitle(song.title)
                        .setURL(song.uri)
                        .setDescription(`by ${song.author}`)
                        // eslint-disable-next-line max-len
                        .setFooter({ text: `For various music settings, run \`${prefix}conf show music\`. Change settings with \`set\` instead of \`show\`.\n\nIf the bot starts to sound robotic, please check if your internet connection is experiencing packet loss.` })
                        .addField('Queue Position', queue.current === song ? 'Now Playing' : String(queue.length), true)
                        .addField('Duration', song.isStream ? 'Livestream' : new Timestamp(`${song.duration >= 86400000 ? 'DD:' : ''}${song.duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(song.duration), true)
                        .addField('Time Left Before Playing', new Timestamp(`${duration >= 86400000 ? 'DD:' : ''}${duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(duration), true)]
                });
            } else {
                // eslint-disable-next-line max-len
                reply(msg, `🎶  ::  **${song.title}** has been added to the queue to position \`${queue.length === 1 ? 'Now Playing' : `#${queue.length - 1}`}\`. For various music settings, run \`${prefix}conf show music\`. Change settings with \`set\` instead of \`show\`.`);
            }
        }

        const newQueue = Array.from(queue);
        newQueue.unshift(queue.current);
        return this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { queue: newQueue });
    }

};
