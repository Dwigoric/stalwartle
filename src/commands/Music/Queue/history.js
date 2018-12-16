const { Command, Timestamp, RichDisplay, util: { chunk } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Shows the queue for the server.',
			extendedHelp: [
				'Export the history by using `s.history export`, clear it with `s.history clear`',
				'To play songs on incognito, simply add the `--incognito` flag **when using the `s.play` command**.'
			],
			usage: '[export|clear]',
			subcommands: true
		});
	}

	async run(msg) {
		const { history } = await this.client.providers.default.get('music', msg.guild.id);
		if (!history.length) throw '<:error:508595005481549846>  ::  There are no songs in the history yet! Songs you play are stored in the history within a day.';
		const message = await msg.channel.send('<a:loading:430269209415516160>  ::  Loading the music history...');
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`Server Music History: ${msg.guild.name}`, msg.guild.iconURL())
			.setTitle('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.setTimestamp());

		let duration = 0;
		chunk(history, 10).forEach((music10, tenPower) => display.addPage(template => template.setDescription(music10.map((music, onePower) => {
			const currentPos = (tenPower * 10) + (onePower + 1);
			const { length } = music.info;
			duration += music.info.isStream ? 0 : length;
			return `\`${currentPos}\`. **${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)} \`${music.info.isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\``; // eslint-disable-line max-len
		}))));

		return display
			.setFooterPrefix('Page ')
			.setFooterSuffix(` [${history.length} History Item${history.length === 1 ? '' : 's'}] - History Duration: ${new Timestamp(`${duration >= 86400000 ? 'DD[d]' : ''}${duration >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(duration)}`) // eslint-disable-line max-len
			.run(message, { filter: (reaction, author) => author === msg.author });
	}

	async export(msg) {
		const { history } = await this.client.providers.default.get('music', msg.guild.id);
		if (!history.length) throw '<:error:508595005481549846>  ::  The history is empty. Songs you play are stored in the history within a day.';
		let choice;
		do {
			choice = await msg.prompt('📜  ::  Should the history be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer.').catch(() => ({ content: 'none' }));
		} while (!['file', 'haste', 'hastebin', 'none', null].includes(choice.content));
		switch (choice.content) {
			case 'file': {
				if (!msg.channel.attachable) throw '<:error:508595005481549846>  ::  I do not have the permissions to attach files to this channel.';
				return msg.channel.sendFile(Buffer.from(history.map(track => track.info.uri).join('\r\n')), 'output.txt', '<:check:508594899117932544>  ::  Exported the history as file.'); // eslint-disable-line max-len
			}
			case 'haste':
			case 'hastebin': {
				const { key } = await fetch('https://hastebin.com/documents', {
					method: 'POST',
					body: history.map(track => track.info.uri).join('\r\n')
				}).then(res => res.json()).catch(() => { throw '<:error:508595005481549846>  ::  Sorry! An unknown error occurred.'; });
				return msg.send(`<:check:508594899117932544>  ::  Exported the history to hastebin: <https://hastebin.com/${key}.stalwartle>`);
			}
		}
		return null;
	}

	async clear(msg) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw '<:error:508595005481549846>  ::  Only DJs can clear the history!';
		const { queue, playlist } = await this.client.providers.default.get('music', msg.guild.id);
		this.client.providers.default.update('music', msg.guild.id, { playlist, queue, history: [] });
		msg.send('<:check:508594899117932544>  ::  Successfully cleared the music history for this server.');
	}

};
