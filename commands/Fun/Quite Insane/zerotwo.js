const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { idioticAPIkey } = require('../../../auth');

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
		msg.channel.sendFile(Buffer.from(await snekfetch
			.get('https://dev.anidiots.guide/generators/zerotwopicture')
			.set('Authorization', idioticAPIkey)
			.query('avatar', love.displayAvatarURL({ format: 'png', size: 128 }))
			.then(res => res.body.data)), 'zerotwo.png');
	}

};
