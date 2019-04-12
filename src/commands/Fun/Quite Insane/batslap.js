const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Batslaps someone! (Or makes someone batslap someone)',
			extendedHelp: [
				'By default, if you do not provide the slapper, you will be the slapper.',
				'To have a different slapper, use `s.batslap @Slapped @Slapper`'
			].join('\n'),
			usage: '<Slapped:user> [Slapper:user]',
			usageDelim: ' '
		});
	}

	async run(msg, [slapped, slapper = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.batSlap(slapper.displayAvatarURL(), slapped.displayAvatarURL()), 'batslap.png');
		message.delete();
	}

};
