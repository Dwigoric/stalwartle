const { Command } = require('klasa');
const { User } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Pls. Just... pls.',
			extendedHelp: 'By default, if you do not provide a user, your display name will be used.',
			usage: '[Pls:user|Pls:string{0,1000}]'
		});
	}

	async run(msg, [pls = msg.author]) {
		let plsed;
		if (pls instanceof User) {
			if (msg.guild) plsed = await msg.guild.members.fetch(pls.id).then(mb => mb.displayName);
			else plsed = pls.username;
		} else {
			plsed = pls;
		}
		msg.channel.sendFile(await this.client.idiot.pls(plsed), 'pls.png');
	}

};
