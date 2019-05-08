const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Rewinds the current song to the specified time.',
			extendedHelp: 'To use this command use e.g. `22m 29s` to rewind the song by 22 minutes and 29 seconds',
			usage: '<SeekTime:time>'
		});
	}

	async run(msg, [seek]) {
		seek -= Date.now();
		const song = await this.client.providers.default.get('music', msg.guild.id).then(ms => ms.queue[0]);
		if (!msg.guild.player.channel || !msg.guild.player.playing) throw `<:error:508595005481549846>  ::  No song playing! Add one using \`${msg.guild.settings.get('prefix')}play\``;
		if (!song.info.isSeekable) throw '<:error:508595005481549846>  ::  The current track playing cannot be rewinded.';
		msg.guild.player.seek(msg.guild.player.state.position - seek);
		return msg.send('<:check:508594899117932544>  ::  Successfully rewinded the music.');
	}

};
