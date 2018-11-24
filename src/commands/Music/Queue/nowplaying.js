const { Command, Timestamp, util: { toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');

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
		if (!queue.length || !msg.guild.player.channel || !msg.guild.player.playing) throw '<:error:508595005481549846>  ::  There is no music playing in this server!';
		const npDuration = parseInt(queue[0].info.length);
		const playedDuration = parseInt(msg.guild.player.state.position);
		const timestamp = new Timestamp(npDuration >= 3600000 ? 'hh:mm:ss' : 'mm:ss');

		const progress = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'.split('');
		progress.splice(Math.ceil(((playedDuration / npDuration) || 0.01) * progress.length) - 1, 1, '🔘');

		return msg.send({
			embed: new MessageEmbed()
				.setTitle(queue[0].info.title)
				.setURL(queue[0].info.uri)
				.setColor('RANDOM')
				.setAuthor(`🎶 Now Playing on ${msg.guild.name}`)
				.setFooter(`by ${queue[0].info.author}`)
				.setDescription(`${progress.join('')} ${queue[0].info.isStream ? 'N/A' : `${parseInt((playedDuration / npDuration) * 100)}%`}`)
				.addField('Repeat', toTitleCase(msg.guild.settings.get('music.repeat')), true)
				.addField('Time', queue[0].info.isStream ? 'N/A - YouTube Livestream' : `\`${timestamp.display(playedDuration)} / ${timestamp.display(npDuration)}\``, true)
		});
	}

};
