const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['catfact', 'kittenfact'],
			description: 'Let me tell you a mysterious cat fact.'
		});
	}

	async run(msg) {
		const { fact } = await fetch('https://catfact.ninja/fact').then(res => res.json());
		return msg.send(`🐱  ::  **Catfact:** *${fact}*`);
	}

};
