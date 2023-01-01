const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Rewinds the current song to the specified time.',
            detailedDescription: 'To use this command use e.g. `22m 29s` to rewind the song by 22 minutes and 29 seconds'
        });
        this.usage = '<SeekTime:time>';
    }

    async messageRun(msg, args) {
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player || !player.playing) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\``);

        let seek = await args.pick('duration').then(duration => duration.getTime()).catch(() => null);
        if (seek === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  How far from the track should I rewind the song to?`);

        seek -= Date.now();

        const song = player.queue.current;
        if (!song.isSeekable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The current track playing cannot be rewinded.`);

        player.seek(player.position - seek);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully rewinded the music.`);
    }

};
