const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['loop'],
			permissionLevel: 5,
			description: 'Sets if the current song will be repeated or the whole queue.',
			usage: '<song|queue|none>'
		});
	}

	async run(msg, [repeat]) {
		msg.guild.settings.update('repeat', repeat);
		msg.send(`<:check:508594899117932544>  ::  Music sessions in this server are now set to repeat ${repeat === 'none' ? 'nothing' : `the ${repeat}`}.`);
	}

};
