const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['tinytext'],
			description: 'Converts a text into tiny text.',
			extendedHelp: 'If you want to get the super/subscipt form, simply use the `--superscript` and `--subscript` flags.',
			usage: '<Tiny:string>'
		});
	}

	async run(msg, [text]) {
		let type = 'tiny';
		if (msg.flags.superscript) type = 'superscript';
		if (msg.flags.subscript) type = 'subscript';
		msg.send(await this.client.idiot.tiny(text, type));
	}

};
