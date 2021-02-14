const { Command, Timestamp, RichDisplay, util: { chunk } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['q'],
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			description: 'Shows the queue for the server.'
		});
	}

	async run(msg) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length) throw `${this.client.constants.EMOTES.xmark}  ::  There are no songs in the queue yet! Add one with \`${msg.guild.settings.get('prefix')}play\``;
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading the music queue...`);
		const np = queue[0];
		const npStatus = msg.guild.me.voice.channelID ?
			msg.guild.player.paused ?
				'⏸' :
				'▶' :
			'⤴ Up Next:';
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`Server Music Queue: ${msg.guild.name}`, msg.guild.iconURL({ dynamic: true }))
			.setTitle('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.setTimestamp());

		queue.shift();
		let duration = np.info.isStream ? 0 : np.info.length;

		await Promise.all((queue.length ? chunk(queue, 10) : [np]).map(async (music10, tenPower) => [`${npStatus} [**${escapeMarkdown(np.info.title)}** by ${escapeMarkdown(np.info.author)}](${np.info.uri}) \`${np.info.isStream ? 'Livestream' : new Timestamp(`${np.info.length >= 86400000 ? 'DD:' : ''}${np.info.length >= 3600000 ? 'HH:' : ''}mm:ss`).display(np.info.length)}\` - ${await this.client.users.fetch(np.requester).then(usr => usr.tag)}\n`].concat(queue.length ? await Promise.all(music10.map(async (music, onePower) => { // eslint-disable-line max-len
			const { length } = music.info;
			duration += music.info.isStream ? 0 : length;
			return `\`${(tenPower * 10) + (onePower + 1)}\`. [**${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)}](${music.info.uri}) \`${music.info.isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\` - ${await this.client.users.fetch(music.requester).then(usr => usr.tag)}`; // eslint-disable-line max-len
		})) : 'No upcoming tracks.'))).then(musicList => musicList.forEach(queue10 => display.addPage(template => template.setDescription(queue10.join('\n')))));

		return display
			.setFooterPrefix('Page ')
			.setFooterSuffix(` [${queue.length} Queue Entr${queue.length === 1 ? 'y' : 'ies'}] - Queue Duration: ${new Timestamp(`${duration >= 86400000 ? 'DD[d]' : ''}${duration >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(duration)}`) // eslint-disable-line max-len
			.run(await message.edit(`${this.client.constants.EMOTES.tick}  ::  Server music queue has been loaded!`), { filter: (reaction, author) => author === msg.author });
	}

};
