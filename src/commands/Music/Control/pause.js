const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 5,
			description: 'Pauses music playing in the voice channel.'
		});
	}

	async run(msg) {
		if (!msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher || !msg.guild.voiceConnection.dispatcher.writable) throw '<:error:508595005481549846>  ::  There is no music playing in this server!'; // eslint-disable-line max-len
		if (msg.guild.voiceConnection.dispatcher.pausedSince) throw `<:error:508595005481549846>  ::  Music is already paused! Resume it with \`${msg.guildSettings.get('prefix')}resume\``;
		msg.guild.voiceConnection.dispatcher.pause();
		return msg.send('<:check:508594899117932544>  ::  Successfully paused the music for this server.');
	}

};
