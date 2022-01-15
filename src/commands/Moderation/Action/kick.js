const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ['KICK_MEMBERS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Kicks a mentioned user.',
            usage: '<Member:member> [Reason:string] [...]',
            usageDelim: ' '
        });
    }

    async messageRun(msg, [member, ...reason]) {
        if (member.id === msg.author.id) throw 'Why would you kick yourself?';
        if (member.id === this.container.client.user.id) throw 'Have I done something wrong?';
        if (member.id === msg.guild.ownerID) throw 'Pretty sure the server owner cannot be kicked...';

        if (msg.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) throw `${this.container.constants.EMOTES.xmark}  ::  You cannot kick this user.`;
        if (!member.kickable) throw `${this.container.constants.EMOTES.xmark}  ::  I cannot kick this user.`;

        reason = reason.length ? reason.join(this.usageDelim) : null;
        await member.kick(reason);
        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${member.user.tag}** (\`${member.id}\`) has been kicked.${reason ? ` **Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, member.user, reason);
    }

};
