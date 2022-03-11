const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
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
    }

    async messageRun(msg, args) {
        let songs = await args.pickResult('string');
        if (!songs.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the queue entry or range of entries you want to remove.`);
        songs = songs.value;

        songs = songs.split('-').slice(0, 2);
        songs = [parseInt(songs[0]), parseInt(songs[1])];

        if (isNaN(songs[0])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Invalid queue entry given. Refer to \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}help remove\` for more information.`); // eslint-disable-line max-len
        if (!songs[1]) songs = songs[0]; // eslint-disable-line prefer-destructuring
        if (songs === 0 || songs[0] === 0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The current song playing cannot be removed from the queue.`);

        const { queue } = await this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!queue.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the queue. Add one using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\`.`);

        if (Array.isArray(songs)) {
            if (songs[0] > songs[1]) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Invalid queue range. The first number must be less than the second.`);
            if (songs[0] > queue.length - 1 || songs[1] > queue.length - 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are only ${queue.length - 1} songs in the queue.`);
            queue.splice(songs[0], songs[1] - songs[0] + 1);
            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully removed songs \`#${songs[0]}\` to \`#${songs[1]}\` from the queue.`);
        } else {
            if (songs > queue.length - 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are only ${queue.length - 1} songs in the queue.`);
            const [song] = queue.splice(songs, 1);
            reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully removed **${escapeMarkdown(song.info.title)}** from the queue.`);
        }

        return this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { queue });
    }

};
