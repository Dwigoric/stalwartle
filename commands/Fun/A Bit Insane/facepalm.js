const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Simply put, this sends an image of a facepalm.',
			extendedHelp: 'By default, if you do not provide a user, your avatar will be used.',
			usage: '[Facepalm:user]'
		});
	}

	async run(msg, [face = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.facepalm(face.displayAvatarURL()), 'facepalm.png');
	}

};
