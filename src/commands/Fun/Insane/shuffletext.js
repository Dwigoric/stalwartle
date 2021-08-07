const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['jumble'],
			description: 'Shuffles any word or phrase you give.',
			usage: '<PhraseToShuffle:string>'
		});
	}

	async run(msg, [string]) {
		const shuffle = (str) => {
			const a = str.split('');

			for (let i = 0; i < a.length; i++) {
				const j = Math.floor(Math.random() * (i + 1));
				const tmp = a[i];
				a[i] = a[j];
				a[j] = tmp;
			}

			return a.join('');
		};

		msg.send(`🔀  ::  ${shuffle(string)}`, { disableMentions: 'everyone' });
	}

};
