const { Command } = require('klasa');

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
				if (['add', 'remove'].includes(action) && !arg) throw '<:redTick:399433440975519754>  ::  Please provide the user/role.';
				if (arg && !['add', 'remove'].includes(action)) throw '<:redTick:399433440975519754>  ::  Please specify if the role/user should be added or removed.';
				if (!arg) return undefined;
				return this.client.arguments.get('member').run(arg, possible, msg);
			})
			.createCustomResolver('role', (arg, possible, msg, [action]) => {
				if (['add', 'remove'].includes(action) && !arg) throw '<:redTick:399433440975519754>  ::  Please provide the user/role.';
				if (arg && !['add', 'remove'].includes(action)) throw '<:redTick:399433440975519754>  ::  Please specify if the role/user should be added or removed.';
				if (!arg) return undefined;
				return this.client.arguments.get('role').run(arg, possible, msg);
			});
	}

	async run(msg) {
		const { roles, users } = msg.guild.settings.moderators;
		const modRoles = roles.map(rl => {
			const modRole = msg.guild.roles.get(rl);
			if (modRole) return modRole.name;
			else msg.guild.settings.update('moderators.roles', rl, msg.guild, { action: 'remove' });
			return null;
		});
		const modUsers = await Promise.all(users.map(async us => {
			const modUser = await msg.guild.members.fetch(us);
			if (modUser) return modUser.user.tag;
			else msg.guild.settings.update('moderators.users', us, msg.guild, { action: 'remove' });
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

	async toggle(msg, mod, action) {
		const type = mod.constructor.name === 'GuildMember' ? 'users' : 'roles';
		const guildConf = msg.guild.settings;
		if (action === 'add' && guildConf.moderators[type].includes(mod.id)) throw '<:redTick:399433440975519754>  ::  This role/user is already a moderator!';
		if (action === 'remove' && !guildConf.moderators[type].includes(mod.id)) throw '<:redTick:399433440975519754>  ::  This role/user is already not a moderator!';
		guildConf.update(`moderators.${type}`, mod.id, msg.guild, { action });
		msg.send(`<:greenTick:399433439280889858>  ::  Successfully ${action}${action.slice(-1) === 'e' ? '' : 'e'}d as moderator.`);
	}

	async init() {
		const guildSchema = this.client.gateways.guilds.schema;
		if (!guildSchema.moderators) {
			guildSchema.add('moderators', {
				type: 'Folder',
				users: {
					type: 'user',
					array: true,
					default: [],
					configurable: true
				},
				roles: {
					type: 'role',
					array: true,
					default: [],
					configurable: true
				}
			});
		}
	}

};
