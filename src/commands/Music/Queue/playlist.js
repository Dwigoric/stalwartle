const { Subcommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { LazyPaginatedMessage, MessagePrompter } = require('@sapphire/discord.js-utilities');
const { Timestamp } = require('@sapphire/timestamp');
const { chunk, mergeObjects } = require('@sapphire/utilities');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const { reply } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

const URL_REGEX = /^(https?:\/\/)?(www\.|[a-zA-Z-_]+\.)?(vimeo\.com|mixer\.com|bandcamp\.com|twitch\.tv|soundcloud\.com|youtube\.com|youtu\.?be)\/.+$/;

module.exports = class extends Subcommand {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Configures server playlist, which plays when queue is empty. More at `s.help playlist`',
            detailedDescription: [
                '***Prompts are not supported when adding tracks to the playlist.***',
                'To add tracks **using the add subcommand**, supply the playlist/album/set link, or the usual way to add videos to the queue with `s.play` command.',
                'To add the current queue to the playlist, run `s.playlist add queue`.',
                'To completely replace the playlist with the current queue, run `s.playlist add queuereplace`.',
                'To remove tracks from the playlist, do the same as you would with `s.remove` but with using the `remove` subcommand.',
                'To clear the playlist, simply use the `clear` subcommand. e.g. `s.playlist clear`',
                'To export the playlist, run `s.playlist export`',
                'To move stuff in the playlist, run `s.playlist move` and I will guide you through the rest of the process.',
                'To shuffle the playlist, run `s.playlist shuffle`.'
            ].join('\n'),
            subcommands: [
                { name: 'add', messageRun: 'add' },
                { name: 'remove', messageRun: 'remove' },
                { name: 'clear', messageRun: 'clear' },
                { name: 'export', messageRun: 'export' },
                { name: 'move', messageRun: 'move' },
                { name: 'shuffle', messageRun: 'shuffle' },
                { name: 'default', messageRun: 'default', default: true }
            ]
        });
        this.usage = '[add|remove|clear|export|move|shuffle] (TracksURLOrPlaylistItems:string)';
    }

    async default(msg) {
        const { playlist } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!playlist.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the playlist yet! Add one with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}playlist add\`.`); // eslint-disable-line max-len
        const message = await msg.reply(`${this.container.constants.EMOTES.loading}  ::  Loading the music playlist...`);
        const display = new LazyPaginatedMessage({
            template: {
                content: `${this.container.constants.EMOTES.tick}  ::  Server music playlist has been loaded!`,
                embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setAuthor({ name: `Server Music Playlist: ${msg.guild.name}`, iconURL: msg.guild.iconURL({ dynamic: true }) })
                    .setTitle('Use the buttons to navigate the pages.')
                    .setTimestamp()]
            }
        });

        let duration = 0;
        chunk(playlist, 10).forEach((music10, tenPower) => display.addPageEmbed(template => template.setDescription(music10.map((music, onePower) => {
            duration += music.isStream ? 0 : music.duration;
            return `\`${(tenPower * 10) + (onePower + 1)}\`. [**${escapeMarkdown(music.title)}** by ${escapeMarkdown(music.author)}](${music.uri}) \`${music.isStream ? 'Livestream' : new Timestamp(`${music.duration >= 86400000 ? 'DD:' : ''}${music.duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(music.duration)}\``; // eslint-disable-line max-len
        }).join('\n'))));

        display.template.embeds[0].setFooter({ text: `[${playlist.length} Playlist Item${playlist.length === 1 ? '' : 's'}] - Playlist Duration: ${new Timestamp(`${duration >= 86400000 ? 'DD[d]' : ''}${duration >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(duration)}` }); // eslint-disable-line max-len

        return display.run(message, msg.author).catch(err => this.container.logger.error(err));
    }

    async add(msg, args) {
        if (this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'donation') < 3) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! This feature is limited to servers which have donated $3 or more.`);
        if (!(await this.container.stores.get('preconditions').get('DJOnly').run(msg)).success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`);

        const songs = await args.pick('url').then(url => url.toString()).catch(() => args.pick('enum', { enum: ['queue', 'queuereplace'] }).catch(() => null));
        if (songs === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the URL of the song(s) you want to add to the playlist.`);

        if (['queue', 'queuereplace'].includes(songs)) {
            switch (songs) {
                case 'queue':
                    this.#addToPlaylist(msg, this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id, 'queue'));
                    break;
                case 'queuereplace':
                    this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { playlist: this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id, 'queue') }, true);
                    break;
            }
            return null;
        } else if (!URL_REGEX.test(songs) && !['.m3u', '.pls'].includes(songs.slice(-4))) {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Unsupported URL.`);
        }

        const { loadType, tracks } = await this.container.erela.search(songs, msg.author.id).catch(error => {
            reply(msg, error.message);
            return { loadType: null, tracks: null };
        });
        if (loadType === tracks === null) return null;
        if (loadType === 'LOAD_FAILED') return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Something went wrong when loading your tracks. Sorry 'bout that! Please try again.`);
        if (loadType === 'NO_MATCHES') return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid stream or URL.`);
        return this.#addToPlaylist(msg, loadType === 'PLAYLIST_LOADED' ?
            tracks :
            tracks[0]);
    }

    async remove(msg, args) {
        if (!(await this.container.stores.get('preconditions').get('DJOnly').run(msg)).success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`);

        let items = await args.pickResult('string');
        if (!items.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the range of items to remove from the playlist.`);
        items = items.value;

        items = items.split('-').slice(0, 2);
        items = [parseInt(items[0]), parseInt(items[1])];
        if (isNaN(items[0])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Invalid playlist entry given. Refer to \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}help remove\` for more information.`); // eslint-disable-line max-len

        if (!items[1]) items = items[0] - 1; // eslint-disable-line prefer-destructuring
        else items = [items[0] - 1, items[1] - 1];
        if (items === -1 || items[0] === -1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  All lists start at 1...`);

        const { playlist } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!playlist.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no items in the playlist. Add one using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\`.`);

        if (Array.isArray(items)) {
            if (items[0] > items[1]) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Invalid playlist range. The first number must be less than the second.`);
            if (items[0] > playlist.length - 1 || items[1] > playlist.length - 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are only ${playlist.length - 1} items in the playlist.`);
            playlist.splice(items[0], items[1] - items[0] + 1);
            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully removed items \`#${items[0] + 1}\` to \`#${items[1] + 1}\` from the playlist.`);
        } else {
            if (items > playlist.length - 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are only ${playlist.length - 1} items in the playlist.`);
            playlist.splice(items, 1);
            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully removed song \`#${items + 1}\` from the playlist.`);
        }
        return this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { playlist });
    }

    async clear(msg) {
        if (!(await this.container.stores.get('preconditions').get('DJOnly').run(msg)).success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`);
        this.container.stores.get('gateways').get('musicGateway').reset(msg.guild.id, 'playlist');
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully cleared the music playlist for this server.`);
    }

    async export(msg) {
        const { playlist } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!playlist.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The playlist is empty. Add one using the \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}playlist add\` command.`); // eslint-disable-line max-len

        const prompter = new MessagePrompter('📜  ::  Should the playlist be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer.', 'message');
        let choice;
        do {
            if (prompter.strategy.appliedMessage) prompter.strategy.appliedMessage.delete();
            choice = await prompter.run(msg.channel, msg.author).catch(() => ({ content: 'none' }));
        } while (!['file', 'haste', 'hastebin', 'none'].includes(choice.content));
        prompter.strategy.appliedMessage.delete();

        switch (choice.content) {
            case 'file': {
                if (!msg.channel.permissionsFor(this.container.client.user).has(['SEND_MESSAGES', 'ATTACH_FILES'])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I do not have the permissions to attach files to this channel.`);
                return reply(msg, { files: [{ attachment: Buffer.from(playlist.map(track => track.uri).join('\r\n')), name: 'output.txt' }], content: `${this.container.constants.EMOTES.tick}  ::  Exported the playlist as file.` });
            }
            case 'haste':
            case 'hastebin': {
                const { key } = await fetch('https://www.toptal.com/developers/hastebin/documents', {
                    method: 'POST',
                    body: playlist.map(track => track.uri).join('\r\n')
                }).then(res => res.json()).catch(() => ({ key: null }));
                if (key === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! An unknown error occurred.`);
                return reply(`${this.container.constants.EMOTES.tick}  ::  Exported the playlist to hastebin: <https://www.toptal.com/developers/hastebin/${key}.stalwartle>`);
            }
        }
        return null;
    }

    async move(msg) {
        if (!(await this.container.stores.get('preconditions').get('DJOnly').run(msg)).success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`);

        const { playlist } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (playlist.length < 2) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no playlist item to move.`);

        const entryPrompter = new MessagePrompter(`${this.container.constants.EMOTES.loading}  ::  Which playlist item do you want to move? Reply with its playlist number.`, 'message');
        let entry;
        do {
            if (entryPrompter.strategy.appliedMessage) entryPrompter.strategy.appliedMessage.delete();
            entry = await entryPrompter.run(msg.channel, msg.author).catch(() => null);
        } while (!parseInt(entry));
        entryPrompter.strategy.appliedMessage.delete();
        entry = parseInt(entry) - 1;

        const positionPrompter = new MessagePrompter(`${this.container.constants.EMOTES.loading}  ::  To which position do you want \`#${entry + 1}\` to be moved to? Reply with the position number.`, 'message');
        let position;
        do {
            if (positionPrompter.strategy.appliedMessage) positionPrompter.strategy.appliedMessage.delete();
            position = await positionPrompter.run(msg.channel, msg.author).catch(() => null);
        } while (!parseInt(position));
        positionPrompter.strategy.appliedMessage.delete();
        position = parseInt(position) - 1;

        if (entry > playlist.length - 1 || position > playlist.length - 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The playlist only has ${playlist.length - 1} entr${playlist.length - 1 === 1 ? 'y' : 'ies'}.`);
        if (entry === position) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  What's the point of moving a playlist to the same position?`);

        playlist.splice(position, 0, playlist.splice(entry, 1)[0]);
        await this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { playlist });

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully moved item \`#${entry + 1}\` to position \`#${position + 1}\`.`);
    }

    async shuffle(msg) {
        if (!(await this.container.stores.get('preconditions').get('DJOnly').run(msg)).success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`);

        const { playlist } = await this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!playlist.length) {
            return reply(msg, [
                `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the playlist.`,
                `Add one with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}playlist add\`.`
            ].join(' '));
        }
        if (playlist.length === 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is only one playlist item... I have nothing to shuffle!`);

        this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, {
            playlist: (() => {
                for (let current = playlist.length - 1; current > 0; current--) {
                    const random = Math.floor(Math.random() * (current + 1));
                    const temp = playlist[current];
                    playlist[current] = playlist[random];
                    playlist[random] = temp;
                }
                return playlist;
            })()
        });
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully shuffled the playlist. Check it out with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}playlist\`.`);
    }

    async #addToPlaylist(msg, items) {
        const { playlist } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);

        const { donation, music, prefix } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        if (Array.isArray(items)) {
            let songCount = 0;
            for (const track of items) {
                if (playlist.length >= music.maxPlaylist) break;
                if (donation < 5 && track.duration > 18_000_000) continue;
                playlist.push(mergeObjects(track, { requester: msg.author.id, incognito: false }));
                songCount++;
            }
            reply(msg, `🎶  ::  **${songCount} song${songCount === 1 ? '' : 's'}** ha${songCount === 1 ? 's' : 've'} been added to the playlist.`);
            if (songCount < items.length) {
                reply(msg, [
                    `⚠  ::  Not all songs were added.`,
                    `Possibilities: (1) You've reached the playlist limit of ${music.maxPlaylist} songs, or (2) all songs longer than 5 hours weren't added.`,
                    `Server moderators and managers can change these limits using the \`conf\` command.`
                ].join(' '));
            }
        } else {
            if (playlist.length >= music.maxPlaylist) {
                return reply(msg, [
                    `${this.container.constants.EMOTES.xmark}  ::  The music playlist for **${msg.guild.name}** has reached the limit of ${music.maxPlaylist} songs; currently ${playlist.length}.`,
                    `Change limit via \`${prefix}conf set music.maxPlaylist <new limit>\`.`
                ].join(' '));
            }
            playlist.push(mergeObjects(items, { requester: msg.author.id, incognito: false }));
            reply(msg, `🎶  ::  **${items.title}** has been added to the playlist.`);
        }
        await this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { playlist });
        return playlist;
    }

};
