const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vaporize'],
			description: 'Converts a text into its vaporized form.',
			usage: '<Vaporize:string>'
		});
	}

	async run(msg, [text]) {
		await msg.send('<a:loading:430269209415516160>  ::  Converting text...');
		msg.send(await this.client.idiot.vapor(text));
	}

};
