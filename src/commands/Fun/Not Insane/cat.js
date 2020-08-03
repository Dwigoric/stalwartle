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
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading image...`);
		await msg.channel.sendFile(`https://cataas.com/cat${msg.flagArgs.gif ? '/gif' : ''}`, `cat.${msg.flagArgs.gif ? 'gif' : 'png'}`);
		message.delete();
	}

};
