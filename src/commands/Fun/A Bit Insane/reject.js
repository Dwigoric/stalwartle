const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rejected'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Gives the stamp of reject on an avatar.',
			extendedHelp: 'Simply do not mention anyone if you want to stamp your avatar as rejected.',
			usage: '[StampUser:user]'
		});
	}

	async run(msg, [user = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.rejected(user.displayAvatarURL({ format: 'png', size: 2048 })), 'rejected.png', user.equals(msg.author) ? '' : `${user} has been rejected!`);
	}

};
