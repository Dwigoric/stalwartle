const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Makes a triggered GIF.',
			extendedHelp: 'If you want to make a GIF for someone, provide their user tag, username, nickname, user ID, or mention them.',
			usage: '[Triggered:user]'
		});
	}

	async run(msg, [missing = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.triggered(missing.displayAvatarURL({ format: 'png' })), 'triggered.gif');
	}

};
