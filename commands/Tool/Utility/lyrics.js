const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const cheerio = require('cheerio');
const { geniusAPIkey } = require('../../../auth');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Searches song lyrics using your search query.',
			usage: '<Query:string>'
		});
	}

	async run(msg, [query]) {
		const results = await snekfetch
			.get(`https://api.genius.com/search`)
			.query({
				access_token: geniusAPIkey, // eslint-disable-line camelcase
				q: query // eslint-disable-line id-length
			})
			.then(snek => snek.body.response.hits);
		if (!results.length) throw '<:redTick:399433440975519754>  ::  No song lyrics found.';
		const lyricFetch = await snekfetch.get(results[0].result.url);
		const $c = await cheerio.load(lyricFetch.body.toString());
		const lyrics = $c('.lyrics').text().trim().split('\n');
		while (lyrics.indexOf('') >= 0) lyrics.splice(lyrics.indexOf(''), 1, '\u200b');
		const fullLyrics = [`__**${results[0].result.full_title}**__\n`]
			.concat(lyrics)
			.concat('\n__*Powered by Genius (https://genius.com)*__')
			.join('\n');

		const swearArray = (msg.guild ? msg.guild.configs.automod.swearWords.map(word => `(?:^|\\W)${word}(?:$|\\W)`) : []).concat([
			'nigga',
			'nigger',
			'fuc?k',
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
		if (swearRegex.test(fullLyrics) && msg.guild && !msg.channel.nsfw) throw '<:redTick:399433440975519754>  ::  The song contains NSFW lyrics and this channel is not marked as NSFW.';
		if (lyrics.join('\n').length > 10000) throw '<:redTick:399433440975519754>  ::  Whoops! The result does not seem to be a song... Please try another search query.';

		return msg.channel.send(fullLyrics, { split: { char: '\u200b' } }).catch(() => msg.channel.send(fullLyrics, { split: true }));
	}

};
