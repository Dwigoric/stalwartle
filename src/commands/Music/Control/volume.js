const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vol'],
			runIn: ['text'],
			description: 'Changes the volume for music sessions in the server.',
			usage: '[Volume:integer{1,300}]'
		});
	}

	async run(msg, [volume]) {
		if (!volume) return msg.send(`🎚  ::  The volume for this server is currently set to ${msg.guild.settings.get('music.volume')}%.`);
		msg.guild.settings.update('music.volume', volume);
		if (msg.guild.me.voice.channelID) msg.guild.player.volume(volume);
		return msg.send(`<:check:508594899117932544>  ::  Successfully changed the volume for this server to ${volume}%.`);
	}

};
