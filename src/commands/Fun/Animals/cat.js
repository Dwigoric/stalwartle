const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random cat image and fact.'
		});
	}

	async run(msg) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading cat...`);

		const { image, fact } = await fetch(`https://some-random-api.ml/animal/cat`)
			.then(res => res.json())
			.catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });
		await msg.channel.sendFile(image, 'cat.jpg', `Random cat fact: ${fact}`);

		message.delete();
	}

};
