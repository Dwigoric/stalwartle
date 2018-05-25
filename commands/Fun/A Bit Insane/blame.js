const { Command } = require('klasa');
const { User } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Blames someone. Or you. 🤷',
			extendedHelp: 'By default, if you do not provide a user, your display name will be used.',
			usage: '[Blamed:user|Blamed:string{0,1000}]'
		});
	}

	async run(msg, [blame = msg.author]) {
		let blamed;
		if (blame instanceof User) {
			if (msg.guild) blamed = await msg.guild.members.fetch(blame.id).then(mb => mb.displayName);
			else blamed = blame.username;
		} else {
			blamed = blame;
		}
		msg.channel.sendFile(await this.client.idiot.blame(blamed), 'blame.png');
	}

};
