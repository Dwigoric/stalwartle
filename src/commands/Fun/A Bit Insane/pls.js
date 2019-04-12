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
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.pls(plsed), 'pls.png');
		message.delete();
	}

};
