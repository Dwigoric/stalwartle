const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Gives you a random dog fact.' });
	}

	async run(msg) {
		await msg.send('<a:loading:430269209415516160>  ::  Loading dogfact...');
		const fact = await fetch('http://dog-api.kinduff.com/api/facts?number=1')
			.then(res => res.json())
			.then(body => body.facts[0]);
		return msg.send(`🐶  ::  **Dogfact:** *${fact}*`);
	}

};
