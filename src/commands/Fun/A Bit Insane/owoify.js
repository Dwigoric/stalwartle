const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['owo'],
			description: 'OwO-ifies a t-text you pwovide. x3',
			usage: '<OwO:string{1,1250}>'
		});
	}

	async run(msg, [text]) {
		msg.send(`😶  ::  ${await this.client.idiot.owoify(text)}`);
	}

};
