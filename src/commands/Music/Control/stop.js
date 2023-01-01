const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Stops the music session in the server and empties the music queue.'
        });
    }

    async messageRun(msg) {
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music session in this server.`);
        this.store.get('play').timeouts.delete(msg.guild.id);

        player.destroy();
        await this.container.stores.get('gateways').get('musicGateway').reset(msg.guild.id, 'queue');
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully ended the music session for this server, and the queue has been emptied.`);
    }

};
