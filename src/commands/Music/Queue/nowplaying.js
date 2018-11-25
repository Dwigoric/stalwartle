const { Command, Timestamp, util: { toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['np'],
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Shows information about the current song playing in the server.'
		});
	}

	async run(msg) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length || !msg.guild.player.channel || !msg.guild.player.playing) throw '<:error:508595005481549846>  ::  There is no music playing in this server!';
		const { length } = queue[0].info;
		const { position } = msg.guild.player.state;
		const timestamp = new Timestamp(length >= 3600000 ? 'hh:mm:ss' : 'mm:ss');

		const progress = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'.split('');
		progress.splice(Math.ceil(((position / length) || 0.01) * progress.length) - 1, 1, '🔘');

		return msg.send({
			embed: new MessageEmbed()
				.setTitle(queue[0].info.title)
				.setURL(queue[0].info.uri)
				.setColor('RANDOM')
				.setAuthor(`🎶 Now Playing on ${msg.guild.name}`)
				.setFooter(`by ${queue[0].info.author}`)
				.setDescription(`${progress.join('')} ${queue[0].info.isStream ? 'N/A' : `${parseInt((position / length) * 100)}%`}`)
				.addField('Time', queue[0].info.isStream ? 'N/A - YouTube Livestream' : `\`${timestamp.display(position)} / ${timestamp.display(length)}\``, true)
				.addField('Volume', `${msg.guild.player.state.volume}%`)
				.addField('Repeat', toTitleCase(msg.guild.settings.get('music.repeat')), true)
				.setTimestamp()
		});
	}

};
