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
		if (!role) throw `<:error:508595005481549846>  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`;
		if (member.roles.highest.position >= msg.guild.me.roles.highest.position) throw `<:error:508595005481549846>  ::  Sorry! I can't edit ${member}'s roles.`;
		if (member.roles.highest.position >= msg.member.roles.highest.position) throw `<:error:508595005481549846>  ::  It seems you cannot edit ${member}'s roles...`;
		if (member.roles.has(role.id)) throw `<:error:508595005481549846>  ::  ${member} already has **${role.name}**! I mean, what's the point of giving someone something they already have?`; // eslint-disable-line max-len
		await member.roles.add(role, `Given using ${this.client.user.username}'s Give Role feature`);
		return msg.send(`<:check:508594899117932544>   ::  Successfully given ${member} the role **${role.name}**.`);
	}

};
