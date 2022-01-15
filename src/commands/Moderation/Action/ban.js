const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ['BAN_MEMBERS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Bans a mentioned user.',
            extendedHelp: [
                'The default amount age of messages to delete is `0` days.',
                'If you want to ban a user indefinitely, simply do not provide the duration.'
            ].join('\n'),
            usage: '<Member:user> [MessageDaysToDelete:integer{1,7}] [Duration:time] [Reason:string] [...]',
            usageDelim: ' '
        });
    }

    async messageRun(msg, [user, days = 0, duration = Infinity, ...reason], force) {
        if (!force && user.id === msg.author.id) throw 'Why would you ban yourself?';
        if (!force && user.id === this.container.client.user.id) throw 'Have I done something wrong?';
        if (user.id === msg.guild.ownerID) throw 'Pretty sure the server owner cannot be banned...';

        const member = await msg.guild.members.fetch(user).catch(() => null);
        if (member && !force) {
            if (msg.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) throw `${this.container.constants.EMOTES.xmark}  ::  You cannot ban this user.`;
            if (!member.bannable) throw `${this.container.constants.EMOTES.xmark}  ::  I cannot ban this user.`;
        }

        const options = { days };
        reason = reason.length ? reason.join(this.usageDelim) : null;
        if (reason) options.reason = reason;
        if (duration && duration !== Infinity) {
            this.container.schedule.create('unban', duration, {
                data: {
                    user: user.id,
                    guild: msg.guild.id
                }
            });
        }

        await msg.guild.members.ban(user, options);
        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been banned. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, user, reason, duration);
    }

};
