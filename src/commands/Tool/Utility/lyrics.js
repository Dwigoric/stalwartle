const { Command } = require('klasa');
const { Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ly'],
			description: 'Searches song lyrics using your search query.',
			usage: '<Query:string>'
		});
		this.NO_LYRICS_FOUND = `${this.client.constants.EMOTES.xmark}  ::  No song lyrics found.`;
	}

	async run(msg, [query]) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading lyrics...`);

		const params = new URLSearchParams();
		params.set('q', query);
		const metadata = await fetch(`https://some-random-api.ml/lyrics?${params}`).then(res => res.json());
		const { lyrics } = metadata;
		while (lyrics.indexOf('') >= 0) lyrics.splice(lyrics.indexOf(''), 1, '\u200b');

		const fullLyrics = [
			[
				`__***${metadata.title}***__`,
				`*by **${metadata.author}***\n`
			].join('\n'),
			escapeMarkdown(lyrics.join('\n'))
		].join('\n');

		const swearArray = (msg.guild ? msg.guild.settings.get('automod.swearWords').map(word => `(?:^|\\W)${word}(?:$|\\W)`) : [])
			.concat(this.client.constants.SWEAR_WORDS_REGEX)
			.map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		const swearRegex = new RegExp(swearArray.join('|'), 'im');
		if (swearRegex.test(fullLyrics) && msg.guild && !msg.channel.nsfw) throw `${this.client.constants.EMOTES.xmark}  ::  The song contains NSFW lyrics and this channel is not marked as NSFW.`;

		await msg.channel.send(fullLyrics, { split: { char: '\u200b' } }).catch(() => msg.channel.send(fullLyrics, { split: true }));
		message.delete();
	}

};
