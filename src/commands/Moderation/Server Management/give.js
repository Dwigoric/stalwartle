const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['MANAGE_ROLES'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Gives a role to a member.'
        });
    }

    async messageRun(msg, args) {
        let member = await args.pickResult('member');
        if (!member.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member who you want to give a role.`);
        member = member.value;
        let role = await args.pickResult('role');
        if (!role.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the role you want to give.`);
        role = role.value;

        if (!role) throw `${this.container.constants.EMOTES.xmark}  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`;
        if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `${this.container.constants.EMOTES.xmark}  ::  ${role.name} has higher or equal position to my highest role!`;
        if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `${this.container.constants.EMOTES.xmark}  ::  I cannot give ${role.name} to this user.`;
        if (member.roles.cache.has(role.id)) throw `${this.container.constants.EMOTES.xmark}  ::  ${member} already has **${role.name}**! I mean, what's the point of giving someone something they already have?`; // eslint-disable-line max-len
        await member.roles.add(role, `Given using ${this.container.client.user.username}'s Give Role feature`);
        return msg.send(`${this.container.constants.EMOTES.tick}  ::  Successfully given ${member} the role **${role.name}**.`);
    }

};
