const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Stops the music session in the server and empties the music queue.'
        });
    }

    async messageRun(msg) {
        if (!msg.guild.me.voice.channel) throw `${this.container.constants.EMOTES.xmark}  ::  There is no music session in this server.`;
        this.store.get('play').timeouts.delete(msg.guild.id);
        this.container.lavacord.leave(msg.guild.id);
        await this.container.databases.default.update('music', msg.guild.id, { queue: [] });
        // eslint-disable-next-line max-len
        return msg.send(`${this.container.constants.EMOTES.tick}  ::  Successfully ended the music session for this server, and the queue has been emptied.`);
    }

};
