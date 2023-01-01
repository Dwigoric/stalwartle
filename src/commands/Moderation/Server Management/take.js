const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['MANAGE_ROLES'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Takes a role from a member.'
        });
        this.usage = '<User:member> <Role:role>';
    }

    async messageRun(msg, args) {
        let member = await args.pickResult('member');
        if (!member.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member you want to take a role from.`);
        member = member.value;
        let role = await args.pickResult('role');
        if (!member.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please indicate the role you want to take.`);
        role = role.value;

        if (!role) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`);
        if (member.roles.highest.position >= msg.guild.me.roles.highest.position) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  ${role.name} has higher or equal position to my highest role!`);
        if (member.roles.highest.position >= msg.guild.me.roles.highest.position) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I cannot take ${role.name} from this user.`);
        if (!member.roles.cache.has(role.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  ${member} already doesn't have **${role.name}**! I mean, what's the point of taking something from someone they already don't have?`); // eslint-disable-line max-len
        await member.roles.remove(role, `Taken using ${this.container.client.user.username}'s Take Role feature`);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully taken the role **${role.name}** from ${member}.`);
    }

};
