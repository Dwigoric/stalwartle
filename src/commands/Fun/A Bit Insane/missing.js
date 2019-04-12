const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Makes a police missing poster.',
			extendedHelp: 'If you want to make a poster for someone, provide their user tag, username, nickname, user ID, or mention them.',
			usage: '[Missing:user]'
		});
	}

	async run(msg, [missing = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.missing(missing.displayAvatarURL(), missing.tag).catch(() => { throw '<:error:508595005481549846>  ::  Something went wrong. Please try again.'; }), 'missing.png'); // eslint-disable-line max-len
		message.delete();
	}

};
