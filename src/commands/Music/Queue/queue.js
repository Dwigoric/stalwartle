const { Command, RichDisplay, util: { chunk } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Shows the queue for the server.'
		});
	}

	async run(msg) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length) throw `<:error:508595005481549846>  ::  There are no songs in the queue yet! Add one with \`${msg.guildSettings.get('prefix')}play\``;
		const np = queue[0];
		const npStatus = msg.guild.player.playing ?
			!msg.guild.player.paused ?
				'▶' :
				'⏸' :
			'⤴ Up Next:';
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`🎶 Server Music Queue: ${msg.guild.name}`)
			.setTimestamp());

		queue.shift();
		if (!queue.length) return msg.channel.send(`${npStatus} **${escapeMarkdown(np.info.title)}** by ${escapeMarkdown(np.info.author)}`);
		chunk(queue, 10).forEach((music10, tenPower) => display.addPage(template => template.setDescription([`${npStatus} **${escapeMarkdown(np.info.title)}** by ${escapeMarkdown(np.info.author)}\n`]
			.concat(music10.map((music, onePower) => {
				const currentPos = (tenPower * 10) + (onePower + 1);
				return `\`${currentPos}\`. **${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)}`;
			})))));

		return display
			.setFooterPrefix('Page ')
			.setFooterSuffix(` [${queue.length} Queue Entr${queue.length === 1 ? 'y' : 'ies'}]`)
			.run(await msg.channel.send('<a:loading:430269209415516160>  ::  Loading the music queue...'), { filter: (reaction, author) => author === msg.author });
	}

};
