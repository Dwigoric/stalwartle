const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['approved'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Gives the stamp of approval on an avatar.',
			extendedHelp: 'Simply do not mention anyone if you want to stamp your avatar as approved.',
			usage: '[StampUser:user]'
		});
	}

	async run(msg, [user = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.approved(user.displayAvatarURL({ format: 'png', size: 2048 })), 'approved.png', user.equals(msg.author) ? '' : `${user} has been approved!`);
	}

};
