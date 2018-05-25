const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Sends an image of a waifu insulting a user. Please note that this is for joke purposes only.',
			extendedHelp: [
				'By default, if you do not provide a user, your avatar will be used.',
				'\n***Do not use this to cyberbully someone. If you see someone, go to my dev server using `s.hub` and report so we can blacklist the user.***'
			].join('\n'),
			usage: '[Insulted:user]'
		});
	}

	async run(msg, [insulted = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.waifuInsult(insulted.displayAvatarURL()), 'insult.png');
	}

};
