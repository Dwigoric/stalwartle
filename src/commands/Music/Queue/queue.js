const { Command, RichDisplay, util: { chunk } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Shows the queue for the server.',
			extendedHelp: [
				'To get the queue, simply do not supply any arguments',
				'To remove a single song from the queue, use `s.queue remove <songID>`',
				'To remove multiple songs from the queue, use `s.queue remove <startSongID>-<endSongID>`',
				'e.g. to remove songs #3 to #5, use `s.queue remove 3-5`'
			],
			usage: '[remove] (QueueItem:string)',
			usageDelim: ' ',
			subcommands: true
		});

		this.createCustomResolver('string', (arg, possible, msg, [action]) => {
			if (!arg) {
				if (action === 'remove') throw '<:error:508595005481549846>  ::  Please supply which song number in the queue you want to remove.';
				else return null;
			}
			arg = arg.split('-').slice(0, 2);
			arg = [parseInt(arg[0]), parseInt(arg[1])];
			if (!arg[1]) return arg[0];
			return arg;
		});
	}

	async run(msg) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length) throw `<:error:508595005481549846>  ::  There are no songs in the queue yet! Add one with \`${msg.guildSettings.get('prefix')}play\``;
		const np = queue[0];
		const npStatus = msg.guild.player.playing ?
			!msg.guild.player.paused ?
				'▶  :: ' :
				'⏸  :: ' :
			'⤴ Up Next:';
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`🎶 Server Music Queue: ${msg.guild.name}`));

		queue.shift();
		if (!queue.length) return msg.channel.send(`${npStatus} **${escapeMarkdown(np.info.title)}** by ${escapeMarkdown(np.info.author)}`);
		chunk(queue, 10).forEach((music10, tenPower) => display.addPage(template => template.setDescription([`${npStatus} **${escapeMarkdown(np.info.title)}** by ${escapeMarkdown(np.info.author)}\n`]
			.concat(music10.map((music, onePower) => {
				const currentPos = (tenPower * 10) + (onePower + 1);
				return `\`${currentPos}\`. **${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)}`;
			})))));

		return display
			.setFooterPrefix('Page ')
			.run(await msg.channel.send('<a:loading:430269209415516160>  ::  Loading the music queue...'), { filter: (reaction, author) => author === msg.author });
	}

	async remove(msg, [songs]) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw '<:error:508595005481549846>  ::  Only DJs and moderators can remove songs from the queue.';
		if (songs === 0 || songs[0] === 0) throw '<:error:508595005481549846>  ::  The current song playing cannot be removed from the queue.';
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length) throw `<:error:508595005481549846>  ::  There are no songs in the queue. Add one using \`${msg.guildSettings.get('prefix')}play\``;
		if (Array.isArray(songs)) {
			if (songs[0] - 1 > queue.length || songs[1] - 1 > queue.length) throw `<:error:508595005481549846>  ::  There are only ${queue.length} songs in the queue.`;
			queue.splice(songs[0], songs[1] - songs[0] + 1);
			msg.send(`<:check:508594899117932544>  ::  Successfully removed songs \`#${songs[0]}\` to \`#${songs[1]}\` from the queue.`);
		} else {
			if (songs - 1 > queue.length) throw `<:error:508595005481549846>  ::  There are only ${queue.length} songs in the queue.`;
			queue.splice(songs, 1);
			msg.send(`<:check:508594899117932544>  ::  Successfully removed song \`#${songs}\` from the queue.`);
		}
		this.client.providers.default.update('music', msg.guild.id, { queue });
	}

};
