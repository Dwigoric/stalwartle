const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 5,
			description: 'Seeks the current song to the specified time.',
			extendedHelp: 'To use this command use e.g. `22m 29s` or `1h 24m 42s`',
			usage: '<SeekTime:time>'
		});
	}

	async run(msg, [seek]) {
		seek -= Date.now();
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length || !msg.guild.player.channel || !msg.guild.player.playing) throw `<:error:508595005481549846>  ::  No song playing! Add one using \`${msg.guildSettings.get('prefix')}play\``; // eslint-disable-line max-len
		if (parseInt(queue[0].info.length < seek)) throw '<:error:508595005481549846>  ::  The time you supplied is longer than the song\'s length.'; // eslint-disable-line max-len
		msg.guild.player.seek(seek);
		return msg.send('<:check:508594899117932544>  ::  Successfully seeked the music.');
	}

};
