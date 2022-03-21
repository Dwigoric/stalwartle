const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Replays the current playing song.'
        });
    }

    async messageRun(msg) {
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player || !player.playing) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\``);

        if (!player.queue.current.isSeekable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The current track playing cannot be replayed.`);

        player.seek(0);
        player.pause(false);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully replayed the music.`);
    }

};
