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
        this.usage = '<Member:member> [MuteDuration:time] [Reason:...string]';
    }

    async messageRun(msg, args) {
        const member = await args.pick('member').catch(() => null);
        if (member === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member to be muted.`);
        const duration = await args.pick('duration').catch(() => Date.now() + (1000 * 60 * 5));
        const reason = await args.rest('string').catch(() => null);

        if (member.user.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Why would you mute yourself?`);
        if (member.user.id === this.container.client.user.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Have I done something wrong?`);
        if (!member.moderatable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I cannot mute that user due to lacking permissions!`);

        reply(msg, `${this.container.constants.EMOTES.tick}  ::  **${member.user.tag}** (\`${member.user.id}\`) has been muted. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', 'mute', msg.author, member.user, msg.guild, { channel: msg.channel, reason, duration });
    }

};
