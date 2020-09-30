const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random elephant fact.'
		});
	}

	async run(msg) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading elephant fact...`);

		const { fact } = await fetch(`https://some-random-api.ml/facts/elephant`).then(res => res.json());
		await msg.channel.send(`🐘  ::  ${fact}`);

		message.delete();
	}

};
