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
		return msg.channel.send(fullLyrics, { split: { char: '\u200b' } }).catch(() => msg.channel.send(fullLyrics, { split: true }));
	}

};
