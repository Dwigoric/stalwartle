const { Command } = require('klasa');
const figletAsync = require('util').promisify(require('figlet'));

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Creates an ASCII banner from what you supply.',
			usage: '<Banner:string{1,50}>'
		});
	}

	async run(msg, [banner]) {
		const data = await figletAsync(banner);
		if (data.length > 2000) throw `${this.client.constants.EMOTES.xmark}  ::  The banner was too long! Please try making it shorter.`;
		if (!data) throw `${this.client.constants.EMOTES.xmark}  ::  Something went wrong! Did you supply a non-alphanumeric character?`;
		return msg.sendCode('', data);
	}

};
