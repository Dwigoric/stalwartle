const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;
const { Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            preconditions: ['DJOnly'],
            description: 'Removes a single entry or multiple entries from the server music queue.',
            detailedDescription: [
                'To remove a single song from the queue, use `s.remove <songID>`',
                'To remove multiple songs from the queue, use `s.remove <startSongID>-<endSongID>`',
                'e.g. to remove songs #3 to #5, use `s.remove 3-5`'
            ].join('\n')
        });
        this.usage = '<QueueItems:string>';
    }

    async messageRun(msg, args) {
        let songs = await args.pick('string').catch(() => null);
        if (songs === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the queue entry or range of entries you want to remove.`);

        songs = songs.split('-').slice(0, 2);
        songs = [parseInt(songs[0]), parseInt(songs[1])];

        if (isNaN(songs[0])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Invalid queue entry given. Refer to \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}help remove\` for more information.`); // eslint-disable-line max-len
        if (!songs[1]) songs = songs[0]; // eslint-disable-line prefer-destructuring
        if (songs === 0 || songs[0] === 0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The current song playing cannot be removed from the queue.`);

        const player = this.container.erela.players.get(msg.guild.id);
        const { queue } = player && player.playing ? player : await this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!queue.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the queue. Add one using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\`.`);

        if (Array.isArray(songs)) {
            if (songs[0] > songs[1]) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Invalid queue range. The first number must be less than the second.`);
            // eslint-disable-next-line max-len
            if (songs[0] > queue.length - (player && player.playing ? 0 : 1) || songs[1] > queue.length - (player && player.playing ? 0 : 1)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are only ${queue.length - (player && player.playing ? 0 : 1)} songs in the queue.`);
            if (player && player.playing) queue.remove(songs[0] - 1, songs[1]);
            else queue.splice(songs[0], songs[1] - songs[0] + 1);
            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully removed songs \`#${songs[0]}\` to \`#${songs[1]}\` from the queue.`);
        } else {
            if (songs > queue.length - (player && player.playing ? 0 : 1)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are only ${queue.length - (player && player.playing ? 0 : 1)} songs in the queue.`);
            const [song] = player && player.playing ? queue.remove(songs - 1) : queue.splice(songs, 1);
            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully removed **${escapeMarkdown(song.title)}** from the queue.`);
        }

        const newQueue = Array.from(queue);
        if (player && player.playing) newQueue.unshift(queue.current);
        return this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { queue: newQueue });
    }

};
