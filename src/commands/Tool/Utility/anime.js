const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ani'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gets information of an anime series from MyAnimeList.',
			usage: '<Anime:string>'
		});
	}

	async run(msg, [keyword]) {
		await msg.send('<a:loading:430269209415516160>  ::  Loading anime...');
		const search = await fetch(`https://myanimelist.net/search/prefix.json?type=anime&keyword=${encodeURIComponent(keyword)}`)
			.then(res => res.json())
			.then(body => body.categories[0]);
		if (!search || !search.items || !search.items.length) throw '<:error:508595005481549846>  ::  Anime series not found!';

		const url = search.items[0].url.split('/');
		url.splice(-1, 1, encodeURIComponent(url.slice(-1)));
		const $ = cheerio.load(await fetch(url.join('/')).then(res => res.text())); // eslint-disable-line id-length
		const anime = {
			url: search.items[0].url,
			title: $('h1').text().trim(),
			description: $('span[itemprop=description]').text(),
			score: parseFloat($('.fl-l.score').text()),
			popularity: parseInt($('.numbers.popularity strong').text().substring(1)),
			ranked: parseInt($('.numbers.ranked strong').text().substring(1)),
			cover: $('.ac').eq(0).attr('src')
		};

		msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(anime.title)
				.setThumbnail(anime.cover)
				.setDescription(anime.description)
				.setURL(anime.url)
				.addField('Score', anime.score, true)
				.addField('Popularity', anime.popularity, true)
				.addField('Rank', anime.ranked, true)
		});
	}

};
