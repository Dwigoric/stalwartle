const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['BAN_MEMBERS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Softbans (bans then automatically unbans) a mentioned user.',
            detailedDescription: 'The default age of messages to delete is `1` day.'
        });
    }

    async messageRun(msg, args) {
        let user = await args.pickResult('user');
        if (!user.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the user to be softbanned.`);
        user = user.value;
        let days = await args.pick('integer').catch(() => 1);
        if (days < 1 || days > 7) days = 1;
        const reason = await args.rest('string').catch(() => null);

        if (user.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Why would you ban yourself?`);
        if (user.id === this.container.client.user.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Have I done something wrong?`);
        if (user.id === msg.guild.ownerId) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Pretty sure the server owner cannot be banned in the first place...`);

        const member = await msg.guild.members.fetch(user).catch(() => null);
        if (member) {
            if (msg.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You cannot ban this user.`);
            if (!member.bannable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I cannot ban this user.`);
        }

        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been softbanned. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', 'softban', msg.author, user, msg.guild, { reason });
    }

};
