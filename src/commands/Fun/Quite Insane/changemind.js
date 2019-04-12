const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['changemymind', 'cmm'],
			description: 'Uses the "Change My Mind" meme.',
			usage: '[User:user] <ChangeMind:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user = msg.author, ...text]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.changemymind(user.displayAvatarURL({ format: 'png' }), text.join(this.usageDelim)), 'changemymind.png');
		message.delete();
	}

};
