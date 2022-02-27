const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['KICK_MEMBERS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Kicks a mentioned user.'
        });
    }

    async messageRun(msg, args) {
        let member = await args.pickResult('member');
        if (!member.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member to kick.`);
        member = member.value;
        const reason = await args.rest('string').catch(() => null);

        if (member.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Why would you kick yourself?`);
        if (member.id === this.container.client.user.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Have I done something wrong?`);
        if (member.id === msg.guild.ownerID) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Pretty sure the server owner cannot be kicked...`);

        if (msg.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You cannot kick this user.`);
        if (!member.kickable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I cannot kick this user.`);

        await member.kick(reason);
        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${member.user.tag}** (\`${member.id}\`) has been kicked.${reason ? ` **Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, member.user, reason);
    }

};
