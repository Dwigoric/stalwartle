const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			runIn: ['text'],
			description: 'Pauses music playing in the voice channel.'
		});
	}

	async run(msg) {
		if (!msg.guild.me.voice.channelID) throw `${this.client.constants.EMOTES.xmark}  ::  There is no music playing in this server!`;
		if (msg.guild.player.paused) throw `${this.client.constants.EMOTES.xmark}  ::  Music is already paused! Resume it with \`${msg.guild.settings.get('prefix')}resume\``;
		msg.guild.player.pause(true);
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully paused the music for this server.`);
	}

};
