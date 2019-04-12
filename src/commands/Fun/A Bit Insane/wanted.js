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
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.wanted(wanted.displayAvatarURL()), 'wanted.png');
		message.delete();
	}

};
