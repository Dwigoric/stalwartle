const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['BAN_MEMBERS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Unbans a user from their ID.'
        });
        this.usage = '<Member:user> [Reason:...string]';
    }

    async messageRun(msg, args) {
        const user = await args.pick('user').catch(() => null);
        if (user === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the user ID.`);
        const reason = await args.rest('string').catch(() => null);

        if (!await msg.guild.bans.fetch({ cache: false }).then(bans => bans.has(user.id))) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  This user isn't banned from this server.`);

        reply(msg, `${this.container.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been unbanned. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', 'unban', msg.author, user, msg.guild, { channel: msg.channel, reason });
    }

};
