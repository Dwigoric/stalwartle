const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pick'],
			description: 'Chooses between two or more choices. Use ` | ` (two spaces, mind you!) to separate each choice.',
			usage: '<Choices:string> [...]',
			usageDelim: ' | '
		});
	}

	async run(msg, [...choices]) {
		if (choices.length === 1) throw '🤔  ::  I don\'t think there\'s a sense in having only one choice...';
		msg.send(`🤔  ::  I choose... **${choices[Math.floor(Math.random() * choices.length)]}**!`, { disableMentions: 'everyone' });
	}

};
