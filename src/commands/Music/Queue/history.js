const { Command, Duration, Timestamp, RichDisplay, util: { chunk } } = require('@sapphire/framework');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			description: 'Shows the songs played in the server in the last 24 hours.',
			extendedHelp: [
				'Export the history by using `s.history export`, clear it with `s.history clear`',
				'To play songs on incognito, simply add the `--incognito` flag **when using the `s.play` command**.'
			],
			usage: '[export|clear]',
			subcommands: true
		});
	}

	async run(msg) {
		if (msg.guild.settings.get('donation') < 3) throw `${this.client.constants.EMOTES.xmark}  ::  Sorry! This feature is limited to servers which have donated $3 or more.`;
		const { history } = await this.client.providers.default.get('music', msg.guild.id);
		if (!history.length) throw `${this.client.constants.EMOTES.xmark}  ::  There are no songs in the history yet! Songs you play are stored in the history within a day.`;
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading the music history...`);
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`Server Music History: ${msg.guild.name}`, msg.guild.iconURL({ dynamic: true }))
			.setTitle('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.setTimestamp());

		let duration = 0;
		await Promise.all(chunk(history, 10).map(async (music10, tenPower) => await Promise.all(music10.map(async (music, onePower) => {
			const { length } = music.info;
			duration += music.info.isStream ? 0 : length;
			return `\`${(tenPower * 10) + (onePower + 1)}\`. [**${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)}](${music.info.uri}) \`${music.info.isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\` - ${await this.client.users.fetch(music.requester).then(usr => usr.tag)} (${Duration.toNow(music.timestamp)} ago)`; // eslint-disable-line max-len
		})))).then(hist => hist.forEach(hist10 => display.addPage(template => template.setDescription(hist10.join('\n')))));

		return display
			.setFooterPrefix('Page ')
			.setFooterSuffix(` [${history.length} History Item${history.length === 1 ? '' : 's'}] - History Duration: ${new Timestamp(`${duration >= 86400000 ? 'DD[d]' : ''}${duration >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(duration)}`) // eslint-disable-line max-len
			.run(message, { filter: (reaction, author) => author === msg.author });
	}

	async export(msg) {
		const { history } = await this.client.providers.default.get('music', msg.guild.id);
		if (!history.length) throw `${this.client.constants.EMOTES.xmark}  ::  The history is empty. Songs you play are stored in the history within a day.`;
		let choice;
		do {
			choice = await msg.prompt('📜  ::  Should the history be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer.').catch(() => ({ content: 'none' }));
		} while (!['file', 'haste', 'hastebin', 'none', null].includes(choice.content));
		switch (choice.content) {
			case 'file': {
				if (!msg.channel.attachable) throw `${this.client.constants.EMOTES.xmark}  ::  I do not have the permissions to attach files to this channel.`;
				return msg.channel.sendFile(Buffer.from(history.map(track => track.info.uri).join('\r\n')), 'output.txt', `${this.client.constants.EMOTES.tick}  ::  Exported the history as file.`); // eslint-disable-line max-len
			}
			case 'haste':
			case 'hastebin': {
				const { key } = await fetch('https://hastebin.com/documents', {
					method: 'POST',
					body: history.map(track => track.info.uri).join('\r\n')
				}).then(res => res.json()).catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  Sorry! An unknown error occurred.`; });
				return msg.send(`${this.client.constants.EMOTES.tick}  ::  Exported the history to hastebin: <https://hastebin.com/${key}.stalwartle>`);
			}
		}
		return null;
	}

	async clear(msg) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw `${this.client.constants.EMOTES.xmark}  ::  Only DJs can clear the history!`;
		this.client.schedule.tasks.filter(tk => tk.taskName === 'shiftHistory' && tk.data.guild === msg.guild.id).forEach(tk => tk.delete());
		this.client.providers.default.update('music', msg.guild.id, { history: [] });
		msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully cleared the music history for this server.`);
	}

};
