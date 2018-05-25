const { Command } = require('klasa');
const { Message } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['magic', 'eightballball'],
			description: 'Magic 8-Ball, does exactly what the toy does.',
			usage: '<MessageID:message|Question:string>'
		});
	}

	async run(msg, [question]) {
		if (question instanceof Message) question = question.content;
		return msg.send(`❓  ::  ${question}\n🎱  ::  ${answers[Math.floor(Math.random() * answers.length)]}`);
	}

};

const answers = [
	'Maybe.',
	'Certainly not.',
	'I hope so.',
	'Not in your wildest dreams.',
	'There is a good chance.',
	'Quite likely.',
	'I think so.',
	'I hope not.',
	'I hope so.',
	'Never!',
	'Fuhgeddaboudit.',
	'Ahaha! Really?!?',
	'Pfft.',
	'Sorry, bucko.',
	'Hell, yes.',
	'Hell to the no.',
	'The future is bleak.',
	'The future is uncertain.',
	'I would rather not say.',
	'Who cares?',
	'Possibly.',
	'Never, ever, ever.',
	'There is a small chance.',
	'Yes!'
];
