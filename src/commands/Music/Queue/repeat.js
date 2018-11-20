const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['loop'],
			permissionLevel: 5,
			runIn: ['text'],
			description: 'Sets if the current song will be repeated or the whole queue.',
			usage: '[song|queue|none]'
		});
		this.symbols = {
			song: '🔂',
			queue: '🔁',
			none: '➡'
		};
	}

	async run(msg, [repeat]) {
		if (!repeat) return msg.send(`${this.symbols[msg.guild.settings.get('music.repeat')]}  ::  Music sessions in this server are set to repeat ${msg.guild.settings.get('music.repeat') === 'none' ? 'nothing' : `the ${msg.guild.settings.get('music.repeat')}`}.`); // eslint-disable-line max-len
		msg.guild.settings.update('music.repeat', repeat);
		return msg.send(`${this.symbols[repeat]}  ::  Music sessions in this server are now set to repeat ${repeat === 'none' ? 'nothing' : `the ${repeat}`}.`);
	}

};
