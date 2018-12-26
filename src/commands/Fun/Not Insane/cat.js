const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			aliases: ['randomcat', 'meow'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Grabs a random cat. Use the `--gif` flag to get a GIF.'
		});
	}

	async run(msg) {
		return msg.channel.sendFile(`https://cataas.com/cat${msg.flags.gif ? '/gif' : ''}`, `cat.${msg.flags.gif ? 'gif' : 'png'}`);
	}

};
