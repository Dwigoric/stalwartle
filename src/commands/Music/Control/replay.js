const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 5,
			description: 'Replays the current playing song.'
		});
	}

	async run(msg) {
		if (!msg.guild.player.channel || !msg.guild.player.playing) throw `<:error:508595005481549846>  ::  No song playing! Add one using \`${msg.guildSettings.get('prefix')}play\``; // eslint-disable-line max-len
		msg.guild.player.seek(0);
		return msg.send('<:check:508594899117932544>  ::  Successfully replayed the music.');
	}

};
