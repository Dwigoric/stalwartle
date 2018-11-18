const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Stops the music playing in the voice channel.' });
	}

	async run(msg) {
		if (!msg.guild.me.voice.channel ||
			!msg.guild.voiceConnection ||
			(msg.guild.voiceConnection && !msg.guild.voiceConnection.dispatcher) ||
			(msg.guild.voiceConnection.dispatcher && !msg.guild.voiceConnection.dispatcher.writable)) throw '<:error:508595005481549846>  ::  There is no music playing in this server!';
		msg.guild.voiceConnection.dispatcher.destroy();
		msg.guild.me.voice.channel.leave();
		return msg.send('<:check:508594899117932544>  ::  Successfully ended the music session for this server.');
	}

};
