const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			runIn: ['text'],
			description: 'Forwards the current song by the specified time.',
			extendedHelp: 'To use this command use e.g. `22m 29s` to forward the song by 22 minutes and 29 seconds.',
			usage: '<SeekTime:time>'
		});
	}

	async run(msg, [seek]) {
		seek -= Date.now();
		const song = await msg.guild.music.get('queue')[0];
		if (!msg.guild.me.voice.channel) throw `${this.client.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${msg.guild.settings.get('prefix')}play\``;
		if (!song.info.isSeekable) throw `${this.client.constants.EMOTES.xmark}  ::  The current track playing cannot be forwarded.`;
		msg.guild.player.seek(msg.guild.player.state.position + seek);
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully forwarded the music.`);
	}

};
