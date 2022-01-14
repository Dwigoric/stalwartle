const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ['MANAGE_ROLES'],
            runIn: ['text'],
            description: 'Gives a role to a member.',
            usage: '<User:member> <Role:role>',
            usageDelim: ' '
        });
    }

    async messageRun(msg, [member, role]) {
        if (!role) throw `${this.container.client.constants.EMOTES.xmark}  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`;
        if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `${this.container.client.constants.EMOTES.xmark}  ::  ${role.name} has higher or equal position to my highest role!`;
        if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `${this.container.client.constants.EMOTES.xmark}  ::  I cannot give ${role.name} to this user.`;
        if (member.roles.cache.has(role.id)) throw `${this.container.client.constants.EMOTES.xmark}  ::  ${member} already has **${role.name}**! I mean, what's the point of giving someone something they already have?`; // eslint-disable-line max-len
        await member.roles.add(role, `Given using ${this.container.client.user.username}'s Give Role feature`);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully given ${member} the role **${role.name}**.`);
    }

};
