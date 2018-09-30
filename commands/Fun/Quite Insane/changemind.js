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
		msg.channel.sendFile(await this.client.idiot.changemymind(user.displayAvatarURL({ format: 'png' }), text.join(this.usageDelim)), 'changemymind.png');
	}

};
