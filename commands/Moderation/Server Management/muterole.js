const { Command } = require('klasa');
const { Role } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			runIn: ['text'],
			requiredPermissions: 'MANAGE_ROLES',
			description: 'Sets the mute role for the server.',
			extendedHelp: 'You can set an existing role as the mute role; or I can make one for you using the name you provide.',
			usage: '[reset] (MuteRole:role|RoleName:string) [...]',
			usageDelim: ' ',
			subcommands: true
		});

		this
			.createCustomResolver('role', (arg, possible, msg, [action]) => {
				if (action === 'reset') return undefined;
				return this.client.arguments.get('role').run(arg, possible, msg);
			})
			.createCustomResolver('string', (arg, possible, msg, [action]) => {
				if (action === 'reset') return undefined;
				if (!arg) throw '<:redTick:399433440975519754>  ::  Please provide the role ID, name or make a new one by providing the new name.';
				return arg;
			});
	}

	async run(msg, [role]) {
		if (role instanceof Role) {
			msg.guild.settings.update('muteRole', role.id, msg.guild);
			return msg.send(`<:greenTick:399433439280889858>  ::  Successfully set this server's mute role to **${role.name}**.`);
		}
		const newRole = await msg.guild.roles.create({
			name: role.join(this.usageDelim),
			permissions: 0
		});
		return msg.send(`<:greenTick:399433439280889858>  ::  Successfully set this server's mute role to **${newRole.name}**.`);
	}

	async reset(msg) {
		msg.guild.settings.reset('muteRole');
		return msg.send('<:greenTick:399433439280889858>  ::  Successfully reset this server\'s mute role.');
	}

	async init() {
		const guildSchema = this.client.gateways.guilds.schema;
		if (!guildSchema.muteRole) guildSchema.add('muteRole', { type: 'role', configurable: true });
	}

};
