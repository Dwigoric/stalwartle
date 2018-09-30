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
		msg.channel.sendFile(await this.client.idiot.steam(user.displayAvatarURL({ format: 'png', size: 2048 }), user.tag), 'steam.png');
	}

};
