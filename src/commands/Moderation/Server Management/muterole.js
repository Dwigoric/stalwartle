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
				if (!arg) throw '<:error:508595005481549846>  ::  Please provide the role ID, name or make a new one by providing the new name.';
				return arg;
			});
	}

	async run(msg, [...role]) {
		if (role[0] instanceof Role) {
			msg.guild.settings.update('muteRole', role[0].id, msg.guild);
			return msg.send(`<:check:508594899117932544>  ::  Successfully set this server's mute role to **${role[0].name}**.`);
		}
		const newRole = await msg.guild.roles.create({
			data: {
				name: role.join(this.usageDelim),
				color: 'DARKER_GREY',
				permissions: 0
			}
		});
		msg.guild.settings.update('muteRole', newRole.id, msg.guild);
		return msg.send(`<:check:508594899117932544>  ::  Successfully set this server's mute role to **${newRole.name}**.`);
	}

	async reset(msg) {
		msg.guild.settings.reset('muteRole');
		return msg.send('<:check:508594899117932544>  ::  Successfully reset this server\'s mute role.');
	}

};
