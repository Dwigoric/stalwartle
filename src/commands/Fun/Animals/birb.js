const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random birb image and fact.'
		});
	}

	async run(msg) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading birb...`);

		const { image, fact } = await fetch(`https://some-random-api.ml/animal/birb`).then(res => res.json());
		await msg.channel.sendFile(image, 'birb.jpg', `Random birb fact: ${fact}`);

		message.delete();
	}

};
