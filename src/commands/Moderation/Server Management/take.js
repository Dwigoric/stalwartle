const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ['MANAGE_ROLES'],
            runIn: ['text'],
            description: 'Takes a role from a member.',
            usage: '<User:member> <Role:role>',
            usageDelim: ' '
        });
    }

    async run(msg, [member, role]) {
        if (!role) throw `${this.container.client.constants.EMOTES.xmark}  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`;
        if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `${this.container.client.constants.EMOTES.xmark}  ::  ${role.name} has higher or equal position to my highest role!`;
        if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `${this.container.client.constants.EMOTES.xmark}  ::  I cannot take ${role.name} from this user.`;
        if (!member.roles.cache.has(role.id)) throw `${this.container.client.constants.EMOTES.xmark}  ::  ${member} already doesn't have **${role.name}**! I mean, what's the point of taking something from someone they already don't have?`; // eslint-disable-line max-len
        await member.roles.remove(role, `Taken using ${this.container.client.user.username}'s Take Role feature`);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully taken the role **${role.name}** from ${member}.`);
    }

};
