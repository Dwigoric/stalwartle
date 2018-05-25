const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Fanslaps someone! (Or makes someone fanslap someone)',
			extendedHelp: [
				'By default, if you do not provide the slapper, you will be the slapper.',
				'To have a different slapper, use `s.fanslap @Slapped @Slapper`'
			].join('\n'),
			usage: '<Slapped:user> [Slapper:user]',
			usageDelim: ' '
		});
	}

	async run(msg, [slapped, slapper = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.fanSlap(slapper.displayAvatarURL(), slapped.displayAvatarURL()), 'fanslap.png');
	}

};
