const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['MODERATE_MEMBERS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Mutes a mentioned user.',
            detailedDescription: 'To mute a user indefinitely, simply do not provide the duration.'
        });
    }

    async messageRun(msg, args) {
        let member = await args.pickResult('member');
        if (!member.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member to be muted.`);
        member = member.value;
        const duration = await args.pick('duration').catch(() => Infinity);
        const reason = await args.rest('string').catch(() => null);

        if (member.user.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Why would you mute yourself?`);
        if (member.user.id === this.container.client.user.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Have I done something wrong?`);

        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${member.user.tag}** (\`${member.user.id}\`) has been muted. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', 'mute', msg.author, member.user, msg.guild, { reason, duration });
    }

};
