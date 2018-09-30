const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Gives the rainbow effect on an avatar.',
			extendedHelp: 'Simply do not mention anyone if you want to give your avatar the rainbow effect.',
			usage: '[RainbowUser:user]'
		});
	}

	async run(msg, [user = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.rainbow(user.displayAvatarURL({ format: 'png', size: 2048 })), 'approved.png');
	}

};
