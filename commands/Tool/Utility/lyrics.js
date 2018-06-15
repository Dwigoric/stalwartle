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
		const lyrics = await snekfetch.get(results[0].result.url);
		const $c = await cheerio.load(lyrics.body.toString());
		return msg.send(await $c('.lyrics').text().trim(), { split: '\n' });
	}

};
