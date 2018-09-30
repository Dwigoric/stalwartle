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
		msg.send(await this.client.idiot.vapor(text));
	}

};
