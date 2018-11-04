const { Command } = require('klasa');
const Dice = require('roll');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['roll'],
			description: 'Rolls a die or multiple dice for you!',
			extendedHelp: [
				'Format: #ds [ + #ds + ... ]',
				'Ex. `s.dice 2d20` or `s.dice 3d10 + 6d12`'
			].join('\n'),
			usage: '[Rolled:string]'
		});
	}

	async run(msg, [rolled]) {
		const dice = new Dice();
		if (!rolled) return msg.send(`🎲  ::  **One die** (default) was embedded with magic and resulted to **${dice.roll('d6').result}**!`);
		if (!dice.validate(rolled)) return msg.send(`<:crossmark:508590460688924693>  ::  **${rolled}** cannot be embedded with magic.`);
		return msg.send(`🎲  ::  **${rolled}** was embedded with magic and resulted to **${dice.roll(rolled).result}**!`);
	}

};
