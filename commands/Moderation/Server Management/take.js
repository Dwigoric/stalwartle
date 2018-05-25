const { Command } = require('klasa');

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
		if (!role) throw `<:redTick:399433440975519754>  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`;
		if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `<:redTick:399433440975519754>  ::  Sorry! I can't edit ${member}'s roles.`;
		if (member.roles.highest.position >= msg.member.roles.highest.position) throw `<:redTick:399433440975519754>  ::  It seems you cannot edit ${member}'s roles...`;
		if (!member.roles.has(role.id)) throw `<:redTick:399433440975519754>  ::  ${member} already doesn't have **${role.name}**! I mean, what's the point of taking something from someone they already don't have?`; // eslint-disable-line max-len
		await member.roles.remove(role);
		return msg.send(`<:greenTick:399433439280889858>  ::  Successfully taken the role **${role.name}** from ${member}.`);
	}

};
