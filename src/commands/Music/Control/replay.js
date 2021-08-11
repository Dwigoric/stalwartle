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
		if (!msg.guild.player || !msg.guild.player.playing) throw `${this.client.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${msg.guild.settings.get('prefix')}play\``;
		const song = await this.client.providers.default.get('music', msg.guild.id).then(ms => ms.queue[0]);
		if (!song.info.isSeekable) throw `${this.client.constants.EMOTES.xmark}  ::  The current track playing cannot be replayed.`;
		msg.guild.player.seek(0);
		msg.guild.player.pause(false);
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully replayed the music.`);
	}

};
