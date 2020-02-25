const { Command } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 8,
			runIn: ['text'],
			description: 'Sets a moderator user/role.',
			extendedHelp: 'If no argument is provided, this will list the moderator roles and members.',
			usage: '[add|remove] (Member:member|Role:role) [...]',
			usageDelim: ' ',
			subcommands: true
		});

		this
			.createCustomResolver('member', (arg, possible, msg, [action]) => {
				if (['add', 'remove'].includes(action) && !arg) throw '<:error:508595005481549846>  ::  Please provide the user/role.';
				if (arg && !['add', 'remove'].includes(action)) throw '<:error:508595005481549846>  ::  Please specify if the role/user should be added or removed.';
				if (!arg) return undefined;
				return this.client.arguments.get('member').run(arg, possible, msg);
			})
			.createCustomResolver('role', (arg, possible, msg, [action]) => {
				if (['add', 'remove'].includes(action) && !arg) throw '<:error:508595005481549846>  ::  Please provide the user/role.';
				if (arg && !['add', 'remove'].includes(action)) throw '<:error:508595005481549846>  ::  Please specify if the role/user should be added or removed.';
				if (!arg) return undefined;
				return this.client.arguments.get('role').run(arg, possible, msg);
			});
	}

	async run(msg) {
		const { roles, users } = await msg.guild.settings.get('moderators');
		const modRoles = roles.map(rl => {
			const modRole = msg.guild.roles.get(rl);
			if (modRole) return modRole.name;
			else msg.guild.settings.update('moderators.roles', rl, { arrayAction: 'remove', guild: msg.guild });
			return null;
		});
		const modUsers = await Promise.all(users.map(async us => {
			const modUser = await msg.guild.members.fetch(us);
			if (modUser) return modUser.user.tag;
			else msg.guild.settings.update('moderators.users', us, { arrayAction: 'remove', guild: msg.guild });
			return null;
		}));
		[modRoles, modUsers].forEach(mods => mods.forEach(mod => { if (!mod) mods.splice(mods.indexOf(mod), 1); }));
		msg.send(`**Roles**:${modRoles.length ? `\n${modRoles.join(' **|** ')}` : ' ***None***'}\n**Users**:${modUsers.length ? `\n${modUsers.join(' **|** ')}` : ' ***None***'}`);
	}

	async add(msg, [mod]) {
		return this.toggle(msg, mod, 'add');
	}

	async remove(msg, [mod]) {
		return this.toggle(msg, mod, 'remove');
	}

	async toggle(msg, mod, arrayAction) {
		const type = mod instanceof GuildMember ? 'users' : 'roles';
		const guildMods = await msg.guild.settings.get('moderators');
		if (arrayAction === 'add' && guildMods[type].includes(mod.id)) throw '<:error:508595005481549846>  ::  This role/user is already a moderator!';
		if (arrayAction === 'remove' && !guildMods[type].includes(mod.id)) throw '<:error:508595005481549846>  ::  This role/user is already not a moderator!';
		msg.guild.settings.update(`moderators.${type}`, mod.id, { arrayAction, guild: msg.guild });
		msg.send(`<:check:508594899117932544>  ::  Successfully ${arrayAction}${arrayAction.slice(-1) === 'e' ? '' : 'e'}d as moderator.`);
	}

};
