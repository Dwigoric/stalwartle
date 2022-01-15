const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Warns a mentioned user.',
            usage: '<Member:member> [Reason:string] [...]',
            usageDelim: ' '
        });
    }

    async messageRun(msg, [member, ...reason]) {
        if (member.user.equals(msg.author)) throw 'Why would you warn yourself?';
        if (member.user.equals(this.container.client.user)) throw 'Have I done something wrong?';

        reason = reason.length > 0 ? reason.join(this.usageDelim) : null;
        msg.channel.send(`${this.container.client.constants.EMOTES.tick}  ::  **${member.user.tag}** (\`${member.id}\`) has been warned.${reason ? ` **Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, member.user, reason);
    }

};
