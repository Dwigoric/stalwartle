const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['randomdog', 'woof'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random dog image from random.dog.',
			extendedHelp: 'This command grabs a random dog from "https://random.dog/woof.json".'
		});
	}

	async run(msg) {
		const _message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		const { message } = await fetch('https://dog.ceo/api/breeds/image/random').then(res => res.json());
		await msg.channel.sendFile(message);
		_message.delete();
	}

};
