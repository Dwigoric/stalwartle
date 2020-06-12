const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			aliases: ['randomcat', 'meow'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random cat image.'
		});
	}

	async run(msg) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');

		const { file } = await fetch('http://aws.random.cat/meow').then(res => res.json());
		await msg.channel.sendFile(file, `cat.${file.slice(file.lastIndexOf('.'), file.length)}`);
		message.delete();
	}

};
