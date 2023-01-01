const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Makes the bot leave the voice channel, if connected to one.'
        });
    }

    async messageRun(msg) {
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music session in this server.`);
        this.store.get('play').timeouts.delete(msg.guild.id);

        if (player) player.destroy();

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully left the voice channel.`);
    }

};
