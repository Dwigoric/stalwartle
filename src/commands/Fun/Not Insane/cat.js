const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			aliases: ['randomcat', 'meow'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random cat image from random.cat.'
		});
	}

	async run(msg) {
		const { file } = await fetch('http://aws.random.cat/meow').then(res => res.json());
		return msg.channel.sendFile(file, `cat.${file.slice(file.lastIndexOf('.'), file.length)}`);
	}

};
