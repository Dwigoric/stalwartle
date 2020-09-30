const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random kangaroo image and fact.'
		});
	}

	async run(msg) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading kangaroo...`);

		const { image, fact } = await fetch(`https://some-random-api.ml/animal/kangaroo`).then(res => res.json());
		await msg.channel.sendFile(image, 'kangaroo.jpg', `Random kangaroo fact: ${fact}`);

		message.delete();
	}

};
