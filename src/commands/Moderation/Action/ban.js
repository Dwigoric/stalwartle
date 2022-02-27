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

    async messageRun(msg, args, force) {
        let user = await args.pickResult('user');
        if (!user.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  `);
        user = user.value;
        let days = await args.pick('integer').catch(() => 0);
        if (days < 0 || days > 7) days = 0;
        const duration = await args.pick('date').catch(() => Infinity);
        const reason = await args.rest('string').catch(() => null);

        if (!force && user.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Why would you ban yourself?`);
        if (!force && user.id === this.container.client.user.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Have I done something wrong?`);
        if (user.id === msg.guild.ownerID) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Pretty sure the server owner cannot be banned...`);

        const member = await msg.guild.members.fetch(user).catch(() => null);
        if (member && !force) {
            if (msg.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You cannot ban this user.`);
            if (!member.bannable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I cannot ban this user.`);
        }

        const options = { days };
        if (reason) options.reason = reason;
        if (duration && duration !== Infinity) {
            this.container.tasks.create('Unban', {
                user: user.id,
                guild: msg.guild.id
            }, duration.getTime() - Date.now());
        }

        await msg.guild.members.ban(user, options);
        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been banned. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, user, reason, duration);
    }

};
