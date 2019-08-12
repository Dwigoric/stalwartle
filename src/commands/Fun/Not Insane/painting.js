const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['paint'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Sends an image of a painting.',
			extendedHelp: 'By default, if you do not provide a user, your avatar will be used.',
			usage: '[Inspiration:user]'
		});
	}

	async run(msg, [user = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.painting(user.displayAvatarURL({ format: 'png', size: 2048 })), 'painting.png');
		message.delete();
	}

};
