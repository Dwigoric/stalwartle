const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['steamprofile'],
			description: 'Gives a steam profile card of someone.',
			usage: '[User:user]'
		});
	}

	async run(msg, [user = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.steam(user.displayAvatarURL({ format: 'png', size: 2048 }), user.tag), 'steam.png');
		message.delete();
	}

};
