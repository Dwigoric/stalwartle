const { Command } = require('klasa');
const { escapeMarkdown } = require('discord.js').Util;
const { parse } = require('url');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Plays music in the server.',
			extendedHelp: [
				'To continue playing from the current music queue (if stopped), simply do not supply any argument.',
				'To force play a song, use the `--force` flag. Only usable by DJs and moderators.'
			],
			usage: '[YouTubeLink:url|Song:integer|Query:string]'
		});
	}

	async run(msg, [query]) {
		if (!msg.guild.player.channel) throw `<:error:508595005481549846>  ::  The bot is not connected to a voice channel. Please use the \`${msg.guildSettings.get('prefix')}join\` command.`;
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!query) {
			if (!queue.length) throw `<:error:508595005481549846>  ::  There are no songs in the queue. Add one using \`${msg.guildSettings.get('prefix')}play\``;
			else return this.play(msg, queue[0]);
		}
		const url = parse(String(query));
		let song;
		if (url.protocol && url.hostname) {
			const linkRes = await this.getSongs(url);
			if (!linkRes.length) throw '<:error:508595005481549846>  ::  You provided an invalid URL.';
			song = linkRes[0]; // eslint-disable-line prefer-destructuring
		} else if (typeof query === 'number') {
			if (!msg.member.queue.length) throw '<:error:508595005481549846>  ::  Please provide a search query first.';
			if (query < 1 || query > msg.member.queue.length) throw `<:error:508595005481549846>  ::  Please pick a number from 1 to ${msg.member.queue.length}.`;
			song = msg.member.queue[query - 1];
			msg.member.clearPrompt();
		} else {
			const results = await this.getSongs(query);
			if (!results.length) {
				throw `<:error:508595005481549846>  ::  No video found for **${query}**.`;
			} else if (results.length === 1) {
				song = results[0]; // eslint-disable-line prefer-destructuring
			} else {
				const finds = results.splice(0, 5);
				msg.member.addPrompt(finds);
				return msg.send([
					`🎶  ::  Please pick the number of the video you want to play: \`${msg.guildSettings.get('prefix')}play <number>\``,
					finds.map((result, index) => `\`${index + 1}\`. **${escapeMarkdown(result.info.title)}** by ${escapeMarkdown(result.info.author)}`).join('\n')
				].join('\n'));
			}
		}
		if (parseInt(song.info.length) > 18000000) throw `<:error:508595005481549846>  ::  **${song.info.title}** is longer than 5 hours.`;
		await this.addToQueue(msg, song);
		return this.play(msg, queue.length ? queue[0] : song);
	}

	async getSongs(query) {
		return await fetch(`http://${this.client.options.nodes[0].host}:${this.client.options.nodes[0].port}/loadtracks?identifier=ytsearch:${encodeURIComponent(query)}`, { headers: { Authorization: this.client.options.nodes[0].password } }).then(res => res.json()).then(res => res.tracks); // eslint-disable-line max-len
	}

	async addToQueue(msg, song) {
		if (msg.flags.force && await msg.hasAtLeastPermissionLevel(5)) return null;
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (queue.length >= 250) throw `<:error:508595005481549846>  ::  The music queue for **${msg.guild.name}** has reached the limit of 250 songs; currently ${queue.length}.`;
		queue.push(song);
		this.client.providers.default.update('music', msg.guild.id, { queue });
		return msg.channel.send(`🎶  ::  **${song.info.title}** has been added to the queue.`);
	}

	async play(msg, song, skip) {
		if ((msg.flags.force && !await msg.hasAtLeastPermissionLevel(5)) || (!msg.flags.force && !skip && msg.guild.player.playing)) return null; // eslint-disable-line max-len
		msg.guild.player.play(song.track);
		msg.guild.player.volume(msg.guild.settings.get('music.volume'));
		msg.guild.player.once('error', error => this.client.emit('wtf', error));
		msg.guild.player.once('end', async () => {
			const { queue } = await this.client.providers.default.get('music', msg.guild.id);
			if (msg.guild.settings.get('music.repeat') === 'queue') queue.push(queue[0]);
			if (msg.guild.settings.get('music.repeat') !== 'song') queue.shift();
			this.client.providers.default.update('music', msg.guild.id, { queue });
			if (queue.length) {
				this.play(msg, queue[0]);
			} else {
				msg.channel.send('👋  ::  No song left in the queue, so the music session has ended! Thanks for listening!');
				this.client.player.leave(msg.guild.id);
			}
		});
		return msg.channel.send(`🎧  ::  Now Playing: **${escapeMarkdown(song.info.title)}** by ${song.info.author}`);
	}

	async init() {
		const defProvider = this.client.providers.default;
		if (!await defProvider.hasTable('music')) defProvider.createTable('music');
	}

};
