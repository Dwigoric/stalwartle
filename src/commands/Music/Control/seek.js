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
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player || !player.playing) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\``);

        let seek = await args.pick('duration').then(duration => duration.getTime()).catch(() => null);
        if (seek === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  What timestamp should I seek? (e.g. 1m5s for 01:05)`);

        seek -= Date.now();

        const song = player.queue.current;
        if (!song.isSeekable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The current track playing cannot be seeked.`);
        if (song.duration < seek) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The time you supplied is longer than the song's length.`);

        player.seek(seek);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully seeked the music.`);
    }

};
