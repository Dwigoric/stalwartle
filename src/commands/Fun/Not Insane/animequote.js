const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gives a random anime quote.'
		});
	}

	async run(msg) {
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading quote...`);

		const { sentence, characther, anime } = await fetch(`https://some-random-api.ml/animu/quote`).then(res => res.json());
		msg.send(`> ${sentence}\n> \n> _**${characther}** on ${anime}_`);

		message.delete();
	}

};
