const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pick'],
			description: 'Chooses between two or more choices.',
			extendedHelp: "To separate each choice, use ` | ` (that one's got two spaces in it!).",
			usage: '<Choices:string> [...]',
			usageDelim: ' | '
		});
	}

	async run(msg, [...choices]) {
		msg.send(choices.length === 1 ? "🤔  ::  I don't think there's a sense in having only one choice..." : `🤔  ::  I choose... **${choices[Math.floor(Math.random() * choices.length)]}**!`);
	}

};
