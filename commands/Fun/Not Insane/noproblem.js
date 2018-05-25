const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['yw', 'np', 'noprob', 'yourewelcome'],
			description: "Sends a YouTube video link of Maui's \"You're Welcome\" from Moana.",
			extendedHelp: 'You can use this if you want to say "You\'re welcome" in a fashionable way.'
		});
	}

	async run(msg) {
		msg.send('https://youtu.be/79DijItQXMM');
	}

};
