const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Have a crush on someone! (Or makes someone have a crush someone)',
			extendedHelp: [
				'By default, if you do not provide the crusher, you will be the who has the feelings.',
				'To have a different crusher, use `s.crush @Crush @Crusher`',
				'\n*Studies say that this command does not simply crush someone, it also improves the mutual feelings. Be careful.*'
			].join('\n'),
			usage: '<Crush:user> [Crusher:user]',
			usageDelim: ' '
		});
	}

	async run(msg, [crush, crusher = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.crush(crush.displayAvatarURL(), crusher.displayAvatarURL()), 'crush.png');
	}

};
