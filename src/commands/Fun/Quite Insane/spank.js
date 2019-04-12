const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Spanks someone! (Or makes someone spank someone)',
			extendedHelp: [
				'By default, if you do not provide the spanker, you will be the spanker.',
				'To have a different spanker, use `s.spank @Spanked @Spanker`'
			].join('\n'),
			usage: '<Spanked:user> [Spanker:user]',
			usageDelim: ' '
		});
	}

	async run(msg, [spanked, spanker = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.superSpank(spanker.displayAvatarURL(), spanked.displayAvatarURL()), 'spanked.png');
		message.delete();
	}

};
