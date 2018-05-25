const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Reverses any word/phrase you give me.',
			usage: '<StringToReverse:string>'
		});
	}

	async run(msg, [string]) {
		msg.send(`↩  ::  ${string.split('').reverse().join('')}`);
	}

};
