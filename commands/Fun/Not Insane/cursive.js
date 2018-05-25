const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Converts a text into its cursive form.',
			extendedHelp: 'If you want to get the bolded form, simply use the `--bold` flag.',
			usage: '<Cursive:string>'
		});
	}

	async run(msg, [text]) {
		let type = 'normal';
		if (msg.flags.bold) type = 'bold';
		msg.send(await this.client.idiot.cursive(text, type));
	}

};
