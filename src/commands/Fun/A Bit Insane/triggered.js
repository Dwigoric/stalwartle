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
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.triggered(missing.displayAvatarURL({ format: 'png', size: 2048 })), 'triggered.gif');
		message.delete();
	}

};
