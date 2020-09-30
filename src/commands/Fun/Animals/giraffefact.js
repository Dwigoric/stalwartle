const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random giraffe fact.'
		});
	}

	async run(msg) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading giraffe fact...`);

		const { fact } = await fetch(`https://some-random-api.ml/facts/giraffe`).then(res => res.json());
		await msg.channel.send(`🦒  ::  ${fact}`);

		message.delete();
	}

};
