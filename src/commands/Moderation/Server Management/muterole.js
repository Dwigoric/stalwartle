const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			runIn: ['text'],
			requiredPermissions: 'MANAGE_ROLES',
			description: 'Sets the mute role for the server.',
			extendedHelp: 'You can set an existing role as the mute role; or I can make one for you using the name you provide.',
			usage: '[reset] <RoleName:string> [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(msg, [...role]) {
		const newRole = await msg.guild.roles.create({
			data: {
				name: role.join(this.usageDelim),
				color: 'DARKER_GREY',
				permissions: 0
			}
		}).catch(() => null);
		if (!newRole) throw '<:error:508595005481549846>  ::  I cannot create the muted role. Please double check my permissions';
		msg.guild.settings.update('muteRole', newRole.id);
		return msg.send(`<:check:508594899117932544>  ::  Successfully set this server's mute role to **${newRole.name}**.`);
	}

	async reset(msg) {
		msg.guild.settings.reset('muteRole');
		return msg.send('<:check:508594899117932544>  ::  Successfully reset this server\'s mute role.');
	}

};
