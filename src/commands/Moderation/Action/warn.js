const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Warns a mentioned user.'
        });
    }

    async messageRun(msg, args) {
        let member = await args.pickResult('member');
        if (!member.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member to be warned.`);
        member = member.value;
        const reason = await args.rest('string').catch(() => null);

        if (member.user.id === msg.author.id) return reply(msg, 'Why would you warn yourself?');
        if (member.user.id === this.container.client.user.id) return reply(msg, 'Have I done something wrong?');

        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${member.user.tag}** (\`${member.id}\`) has been warned.${reason ? ` **Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, member.user, reason);
    }

};
