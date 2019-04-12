const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Sends a picture of two users saying they are a match on Tinder.',
			usage: '<FirstUser:user> [SecondUser:user]',
			usageDelim: ' '
		});
	}

	async run(msg, [first, second = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.tinderMatch(first.displayAvatarURL({ format: 'png', size: 2048 }), second.displayAvatarURL({ format: 'png', size: 2048 })), 'tinder.png');
		message.delete();
	}

};
