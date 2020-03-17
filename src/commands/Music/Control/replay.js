const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			runIn: ['text'],
			description: 'Replays the current playing song.'
		});
	}

	async run(msg) {
		const song = msg.guild.music.get('queue')[0];
		if (!msg.guild.me.voice.channelID) throw `<:error:508595005481549846>  ::  No song playing! Add one using \`${msg.guild.settings.get('prefix')}play\``;
		if (!song.info.isSeekable) throw '<:error:508595005481549846>  ::  The current track playing cannot be replayed.';
		msg.guild.player.seek(0);
		msg.guild.player.pause(false);
		return msg.send('<:check:508594899117932544>  ::  Successfully replayed the music.');
	}

};
