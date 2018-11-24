const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 5,
			description: 'Seeks the current song to the specified time.',
			extendedHelp: 'To use this command use e.g. `22m 29s` to rewind the song by 22 minutes and 29 seconds',
			usage: '<SeekTime:time>'
		});
	}

	async run(msg, [seek]) {
		seek -= Date.now();
		if (!msg.guild.player.channel || !msg.guild.player.playing) throw `<:error:508595005481549846>  ::  No song playing! Add one using \`${msg.guildSettings.get('prefix')}play\``;
		msg.guild.player.seek(msg.guild.player.state.position - seek);
		return msg.send('<:check:508594899117932544>  ::  Successfully rewinded the music.');
	}

};
