const { Command, util: { toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const moment = require('moment-timezone');

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
		const npSecs = parseInt(np.length_seconds);
		const playedSecs = parseInt(msg.guild.voiceConnection.dispatcher.count / 100);

		const duration = moment(npSecs * 1000);
		const played = moment(playedSecs * 1000);

		const progress = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'.split('');
		progress.splice(Math.ceil((playedSecs / npSecs) * progress.length) - 1, 1, '🔘');

		msg.send({
			embed: new MessageEmbed()
				.setTitle(np.title)
				.setURL(queue[0])
				.setColor('RANDOM')
				.setDescription(`${progress.join('')} ${parseInt((playedSecs / npSecs) * 100)}%`)
				.addField('Repeat', toTitleCase(msg.guild.settings.get('music.repeat')), true)
				.addField('Time', [
					[
						`\`${npSecs >= 3600 ? `${played.hours() < 10 ? '0' : ''}${played.hours()}:` : ''}`,
						`${npSecs >= 60 ? `${played.minutes() < 10 ? '0' : ''}${played.minutes()}:` : ''}`,
						`${played.seconds() < 10 ? '0' : ''}${played.seconds()}`
					].join(''),
					`/`,
					[
						`${npSecs >= 3600 ? `${duration.hours() < 10 ? '0' : ''}${duration.hours()}:` : ''}`,
						`${npSecs >= 60 ? `${duration.minutes() < 10 ? '0' : ''}${duration.minutes()}:` : ''}`,
						`${duration.seconds() < 10 ? '0' : ''}${duration.seconds()}\``
					].join('')
				].join(' '), true)
				.setImage(np.thumbnail_url)
		});
	}

};
