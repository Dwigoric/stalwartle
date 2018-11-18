const { Command, RichDisplay, util: { chunk } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const ytdl = require('ytdl-core');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows the queue for the server.',
			extendedHelp: [
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
		const np = await ytdl.getBasicInfo(queue[0]);
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`🎶 Server Music Queue: ${msg.guild.name}`));

		queue.shift();
		await Promise.all(chunk(queue, 10).map(async (music10, tenPower) => await Promise.all(music10.map(async (music, onePower) => {
			const currentPos = (tenPower * 10) + (onePower + 1);
			const info = await ytdl.getBasicInfo(music);
			return `\`${currentPos}\`. **${escapeMarkdown(info.title)}** by ${escapeMarkdown(info.author.name)}`;
		})))).then(songs => songs.forEach(songList => display.addPage(template => template.setDescription(
			[`${msg.guild.voiceConnection && msg.guild.voiceConnection.dispatcher ?
				!msg.guild.voiceConnection.dispatcher.pausedSince ?
					'▶  :: ' :
					'⏸  :: ' :
				'⤴ Up Next:'} **${np.title}** by ${np.author.name}\n`].concat(songList).join('\n')
		))));

		return display
			.setFooterPrefix('Page ')
			.run(await msg.channel.send('<a:loading:430269209415516160>  ::  Loading the music queue...'), { filter: (reaction, author) => author === msg.author });
	}

	async remove(msg, [songs]) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw '<:error:508595005481549846>  ::  Only DJs and moderators can remove songs from the queue.';
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (Array.isArray(songs)) {
			if (songs[0] > queue.length || songs[1] > queue.length) throw `<:error:508595005481549846>  ::  There are only ${queue.length} songs in the queue.`;
			queue.splice(songs[0], songs[1] - songs[0] + 1);
			msg.send(`<:check:508594899117932544>  ::  Successfully removed songs \`#${songs[0]}\` to \`#${songs[1]}\` from the queue.`);
		} else {
			if (songs > queue.length) throw `<:error:508595005481549846>  ::  There are only ${queue.length} songs in the queue.`;
			queue.splice(songs, 1);
			msg.send(`<:check:508594899117932544>  ::  Successfully removed song \`#${songs}\` from the queue.`);
		}
		this.client.providers.default.update('music', msg.guild.id, { queue });
	}

};
