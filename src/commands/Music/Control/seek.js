const { Command } = require('klasa');
const ytdl = require('ytdl-core');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			cooldown: 60,
			permissionLevel: 5,
			description: 'Seeks the current song to the specified time.',
			extendedHelp: 'To use this command use e.g. `22m 29s` or `1h 24m 42s`',
			usage: '<SeekTime:time>'
		});
	}

	async run(msg, [seek]) {
		seek = (seek - Date.now()) / 1000;
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length || !msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher) throw `<:error:508595005481549846>  ::  No song playing! Add one using \`${msg.guildSettings.get('prefix')}play\``; // eslint-disable-line max-len
		if (parseInt(await ytdl.getBasicInfo(queue[0]).then(info => info.length_seconds)) < seek) throw '<:error:508595005481549846>  ::  The time you supplied is longer than the song\'s length.'; // eslint-disable-line max-len
		msg.guild.settings.update('music.seek', seek * 1000);
		msg.send('<a:loading:430269209415516160>  ::  Loading the song on the specified time...');
		await msg.guild.voiceConnection.play(ytdl(queue[0], { quality: 'highestaudio' }), { seek, volume: msg.guild.settings.get('music.volume') / 100 }).on('end', async () => {
			if (msg.guild.settings.get('music.repeat') === 'queue') queue.push(queue[0]);
			if (msg.guild.settings.get('music.repeat') !== 'song') queue.shift();
			this.client.providers.default.update('music', msg.guild.id, { queue });
			if (queue.length) {
				this.store.get('play').play(msg, queue[0]);
			} else {
				msg.channel.send('👋  ::  No song left in the queue, so the music session has ended! Thanks for listening!');
				msg.guild.voiceConnection.dispatcher.destroy();
				msg.guild.me.voice.channel.leave();
			}
		});
		return msg.send('<:check:508594899117932544>  ::  Successfully seeked the music.');
	}

};
