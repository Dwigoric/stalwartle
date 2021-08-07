const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 8,
			runIn: ['text'],
			requiredPermissions: ['MANAGE_ROLES'],
			description: 'Sets the role to be assigned to either bots or users when they join the server.',
			extendedHelp: "In case I can't assign the role, I will send the server owner why.",
			usage: '<user|bot> <remove|Role:role> [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async user(msg, [role]) {
		return await this.setRole(msg, role, 'user');
	}

	async bot(msg, [role]) {
		return await this.setRole(msg, role, 'bot');
	}

	async setRole(msg, role, type) {
		if (role === 'remove') {
			msg.guild.settings.reset(`autorole.${type}`);
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  The autorole for ${type}s has been removed!`);
		}
		if (!role) throw `${this.client.constants.EMOTES.xmark}  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`;
		if (role.position >= msg.guild.me.roles.highest.position) throw `${this.client.constants.EMOTES.xmark}  ::  Sorry! That role is higher than mine!`;
		if (role.position >= msg.member.roles.highest.position) throw `${this.client.constants.EMOTES.xmark}  ::  It seems that role is higher than yours...`;
		msg.guild.settings.update(`autorole.${type}`, role.id, msg.guild);
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  The autorole for ${type}s has been set to **${role.name}**.`);
	}


};
