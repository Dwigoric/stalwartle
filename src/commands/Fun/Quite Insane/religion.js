const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Uses the religion text message meme.',
			usage: '[User:user]'
		});
	}

	async run(msg, [user = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.religion(user.displayAvatarURL({ format: 'png', size: 2048 })), 'religion.png');
		message.delete();
	}

};
