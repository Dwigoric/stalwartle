const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Gives a random meme.'
		});
	}

	async run(msg) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading meme...`);

		const meme = await fetch(`https://some-random-api.ml/meme`).then(res => res.json());
		msg.channel.sendFile(meme.image, 'meme.png', meme.caption);

		message.delete();
	}

};
