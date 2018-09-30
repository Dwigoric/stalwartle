const { Command } = require('klasa');

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

	async run(msg, [member, role]) {
		if (!role) throw `<:redTick:399433440975519754>  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`;
		if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `<:redTick:399433440975519754>  ::  Sorry! I can't edit ${member}'s roles.`;
		if (member.roles.highest.position >= msg.member.roles.highest.position) throw `<:redTick:399433440975519754>  ::  It seems you cannot edit ${member}'s roles...`;
		if (member.roles.has(role.id)) throw `<:redTick:399433440975519754>  ::  ${member} already has **${role.name}**! I mean, what's the point of giving someone something they already have?`; // eslint-disable-line max-len
		await member.roles.add(role, `Given using ${this.client.user.username}'s Give Role feature`);
		return msg.send(`<:greenTick:399433439280889858>  ::  Successfully given ${member} the role **${role.name}**.`);
	}

};
