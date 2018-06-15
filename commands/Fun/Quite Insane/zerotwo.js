const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: "Make Zero Two love your/someone else's picture!",
			extendedHelp: [
				'By default, if you do not provide a user, your avatar will be used.',
				'To have a different person, use `s.zerotwo @Mention`'
			].join('\n'),
			usage: '[Love:user]'
		});
	}

	async run(msg, [love = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.zerotwo(love.displayAvatarURL({ format: 'png' })), 'zerotwo.png');
	}

};
