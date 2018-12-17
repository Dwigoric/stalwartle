const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			aliases: ['superpunch', 'smack'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Punches someone! (Or makes someone punch someone)',
			extendedHelp: [
				'By default, if you do not provide the puncher, you will be the puncher.',
				'To have a different puncher, use `s.punch @Punched @Puncher`'
			].join('\n'),
			usage: '<Punched:user> [Puncher:user]',
			usageDelim: ' '
		});
	}

	async run(msg, [punched, puncher = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.superPunch(puncher.displayAvatarURL(), punched.displayAvatarURL()), 'superpunch.png');
	}

};
