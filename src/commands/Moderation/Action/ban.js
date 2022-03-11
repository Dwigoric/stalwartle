const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['BAN_MEMBERS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Bans a mentioned user.',
            detailedDescription: [
                'The default amount age of messages to delete is `0` days.',
                'If you want to ban a user indefinitely, simply do not provide the duration.'
            ].join('\n')
        });
    }

    async messageRun(msg, args) {
        let user = await args.pickResult('user');
        if (!user.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member to be banned.`);
        user = user.value;
        const days = await args.pick('integer').then(dayAmt => dayAmt < 0 || dayAmt > 7 ? 0 : dayAmt).catch(() => 0);
        const duration = await args.pick('duration').catch(() => Infinity);
        const reason = await args.rest('string').catch(() => null);

        if (user.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Why would you ban yourself?`);
        if (user.id === this.container.client.user.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Have I done something wrong?`);
        if (user.id === msg.guild.ownerId) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Pretty sure the server owner cannot be banned...`);

        const member = await msg.guild.members.fetch(user).catch(() => null);
        if (member) {
            if (msg.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You cannot ban this user.`);
            if (!member.bannable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I cannot ban this user.`);
        }

        reply(msg, `${this.container.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been banned. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', 'ban', msg.author, user, reason, msg.guild, { reason, duration, banDays: days });
    }

};
