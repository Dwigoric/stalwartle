const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['MODERATE_MEMBERS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Unmutes a mentioned user.'
        });
        this.usage = '<Member:member> [Reason:...string]';
    }

    async messageRun(msg, args) {
        const member = await args.pick('member').catch(() => null);
        if (member === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member to be unmuted.`);
        const reason = await args.rest('string').catch(() => null);

        if (member.user.id === msg.author.id) return reply(msg, 'Look... how are you able to use this command if you were already unmuted?');
        if (member.user.id === this.container.client.user.id) return reply(msg, '*Unmutes self*. Oh, I would not have been able to respond if I were in the first place!');

        reply(msg, `${this.container.constants.EMOTES.tick}  ::  **${member.user.tag}** (\`${member.id}\`) has been unmuted. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', 'unmute', msg.author, member.user, msg.guild, { channel: msg.channel, reason });
    }

};
