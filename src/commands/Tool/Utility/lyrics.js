const { Command } = require('klasa');
const { Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Searches song lyrics using your search query.',
			usage: '<Query:string>'
		});
		this.NO_LYRICS_FOUND = `${this.client.constants.EMOTES.xmark}  ::  No song lyrics found.`;
	}

	async run(msg, [query]) {
		const message = await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading lyrics...`);

		const params = new URLSearchParams();
		params.set('q', query);
		const { response: { hits } } = await fetch(`https://api.genius.com/search?${params}`, { headers: { Authorization: `Bearer ${this.client.auth.geniusAPIkey}` } }).then(res => res.json()).catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  An error occured. Please try again. Sorry 'bout that!`; }); // eslint-disable-line max-len
		if (!hits.length) throw this.NO_LYRICS_FOUND;
		const hit = hits.filter(_hit => _hit.type === 'song')[0];
		if (!hit) throw this.NO_LYRICS_FOUND;
		const $ = cheerio.load(await fetch(hit.result.url).then(res => res.text())); // eslint-disable-line id-length
		const lyrics = $('.lyrics').text().trim().split('\n');
		while (lyrics.indexOf('') >= 0) lyrics.splice(lyrics.indexOf(''), 1, '\u200b');
		const fullLyrics = [
			[
				`__***${hit.result.title_with_featured}***__`,
				`*by **${hit.result.primary_artist.name}***\n`
			].join('\n'),
			escapeMarkdown(lyrics.join('\n')),
			'\n__*Powered by Genius (https://genius.com)*__'
		].join('\n');

		const swearArray = (msg.guild ? msg.guild.settings.get('automod.swearWords').map(word => `(?:^|\\W)${word}(?:$|\\W)`) : []).concat([
			'raped?',
			'bullshit',
			'nigga',
			'nigger',
			'fuc?ke?r?',
			'cunt',
			'cnut',
			'b(i|1|!)tch',
			'd(i|1)ck',
			'pussy',
			'asshole',
			'blowjob',
			'c(u|0|o|\\(\\))ck',
			'sex',
			'porn'
		]).map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		const swearRegex = new RegExp(swearArray.join('|'), 'im');
		if (swearRegex.test(fullLyrics) && msg.guild && !msg.channel.nsfw) throw `${this.client.constants.EMOTES.xmark}  ::  The song contains NSFW lyrics and this channel is not marked as NSFW.`;

		await msg.channel.send(fullLyrics, { split: { char: '\u200b' } }).catch(() => msg.channel.send(fullLyrics, { split: true }));
		message.delete();
	}

};
