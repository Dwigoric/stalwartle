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
		const { message } = await fetch('https://dog.ceo/api/breeds/image/random').then(res => res.json());
		return msg.channel.sendFile(message);
	}

};
