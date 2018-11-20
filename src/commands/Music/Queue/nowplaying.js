const { Command, Timestamp, util: { toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['np'],
			runIn: ['text'],
			description: 'Shows information about the current song playing in the server.'
		});
	}

	async run(msg) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length || !msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher) throw '<:error:508595005481549846>  ::  There\'s nothing playing in this server.';
		const np = await ytdl.getBasicInfo(queue[0]);
		const npDuration = parseInt(np.length_seconds) * 1000;
		const playedDuration = parseInt(msg.guild.voiceConnection.dispatcher.streamTime);
		const timestamp = new Timestamp(npDuration >= 60000 ? npDuration >= 3600000 ? 'hh:mm:ss' : 'mm:ss' : 'ss');

		const progress = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'.split('');
		progress.splice(Math.ceil((playedDuration / npDuration) * progress.length) - 1, 1, '🔘');

		return msg.send({
			embed: new MessageEmbed()
				.setTitle(np.title)
				.setURL(queue[0])
				.setColor('RANDOM')
				.setAuthor(`🎶 Now Playing on ${msg.guild.name}`)
				.setFooter(`on ${np.author.name}`)
				.setDescription(`${progress.join('')} ${np.pltype === 'content' ? `${parseInt((playedDuration / npDuration) * 100)}%` : 'N/A'}`)
				.addField('Repeat', toTitleCase(msg.guild.settings.get('music.repeat')), true)
				.addField('Time', np.pltype === 'content' ? `\`${timestamp.display(playedDuration)} / ${timestamp.display(npDuration)}\`` : 'N/A - YouTube Livestream', true)
				.setImage(np.thumbnail_url)
		});
	}

};
