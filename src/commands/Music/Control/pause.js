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
		if (!msg.guild.me.voice.channelID) throw '<:error:508595005481549846>  ::  There is no music playing in this server!';
		if (msg.guild.player.paused) throw `<:error:508595005481549846>  ::  Music is already paused! Resume it with \`${msg.guild.settings.get('prefix')}resume\``;
		msg.guild.player.pause(true);
		return msg.send('<:check:508594899117932544>  ::  Successfully paused the music for this server.');
	}

};
