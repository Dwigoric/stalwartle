const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Makes the bot leave the voice channel, if connected to one.'
        });
    }

    async messageRun(msg) {
        if (!msg.guild.me.voice.channel) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music session in this server.`);
        this.store.get('play').timeouts.delete(msg.guild.id);
        this.container.lavacord.leave(msg.guild.id);

        const song = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id).queue[0];
        if (song && song.requester === this.container.client.user.id) this.container.stores.get('gateways').get('musicGateway').reset(msg.guild.id, 'queue');

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully left the voice channel.`);
    }

};
