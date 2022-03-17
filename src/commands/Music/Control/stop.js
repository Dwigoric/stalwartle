const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

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
        if (!msg.guild.me.voice.channel) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music session in this server.`);
        this.store.get('play').timeouts.delete(msg.guild.id);
        this.container.lavacord.leave(msg.guild.id);
        await this.container.stores.get('gateways').get('musicGateway').reset(msg.guild.id, 'queue');
        // eslint-disable-next-line max-len
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully ended the music session for this server, and the queue has been emptied.`);
    }

};
