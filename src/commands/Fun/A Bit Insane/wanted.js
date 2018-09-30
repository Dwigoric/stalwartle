const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Makes a wanted poster.',
			extendedHelp: 'If you want to make a poster for someone, provide their user tag, username, nickname, user ID, or mention them.',
			usage: '[Wanted:user]'
		});
	}

	async run(msg, [wanted = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.wanted(wanted.displayAvatarURL()), 'wanted.png');
	}

};
