const { Command } = require('klasa');
const fetch = require('node-fetch');
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
		msg.channel.sendFile(Buffer.from(await fetch(`https://dev.anidiots.guide/generators/zerotwopicture?avatar=${love.displayAvatarURL({
			format: 'png',
			size: 128
		})}`, { headers: { Authorization: idioticAPIkey } })
			.then(res => res.body.data)), 'zerotwo.png');
	}

};
