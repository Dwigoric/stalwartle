const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Seeks the current song to the specified time.',
            detailedDescription: 'To use this command use e.g. `22m 29s` or `1h 24m 42s`'
        });
        this.usage = '<SeekTime:time>';
    }

    async messageRun(msg, args) {
        let seek = await args.pickResult('duration');
        if (!seek.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  What timestamp should I seek? (e.g. 1m5s for 01:05)`);
        seek = seek.value;

        seek -= Date.now();
        const { queue } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!queue.length || !msg.guild.me.voice.channel) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\`.`); // eslint-disable-line max-len
        if (!queue[0].info.isSeekable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The current track playing cannot be seeked.`);
        if (queue[0].info.length < seek) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The time you supplied is longer than the song's length.`);

        this.container.lavacord.players.get(msg.guild.id).seek(seek);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully seeked the music.`);
    }

};
