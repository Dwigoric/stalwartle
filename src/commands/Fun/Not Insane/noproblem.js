const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['yw', 'noprob', 'yourewelcome'],
			description: "Sends a GIF of Maui's \"You're Welcome\" from Moana.",
			extendedHelp: 'You can use this if you want to say "You\'re welcome" in a fashionable way.'
		});
	}

	async run(msg) {
		msg.send('https://giphy.com/gifs/hqg-tXTqLBYNf0N7W');
	}

};
