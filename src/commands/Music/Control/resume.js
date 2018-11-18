const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			description: 'Resumes paused music in the server.'
		});
	}

	async run(msg) {
		if (!msg.guild.me.voice.channel ||
			!msg.guild.voiceConnection ||
			(msg.guild.voiceConnection && !msg.guild.voiceConnection.dispatcher) ||
			(msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.writable)) throw '<:error:508595005481549846>  ::  There is no music playing in this server!';
		if (!msg.guild.voiceConnection.dispatcher.pausedSince) throw `<:error:508595005481549846>  ::  Music is already playing! Pause it with \`${msg.guildSettings.get('prefix')}pause\``;
		msg.guild.voiceConnection.dispatcher.resume();
		return msg.send('<:check:508594899117932544>  ::  Successfully resumed the music for this server.');
	}

};
