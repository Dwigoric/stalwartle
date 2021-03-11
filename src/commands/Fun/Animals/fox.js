const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random fox image and fact.'
		});
	}

	async run(msg) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading fox...`);

		const { image, fact } = await fetch(`https://some-random-api.ml/animal/fox`)
			.then(res => res.json())
			.catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  An unexpected error occured. Sorry about that!`; });
		await msg.channel.sendFile(image, 'fox.jpg', `Random fox fact: ${fact}`);

		message.delete();
	}

};
