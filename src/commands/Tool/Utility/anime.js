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
		const search = await fetch(`https://myanimelist.net/search/prefix.json?type=anime&keyword=${encodeURIComponent(keyword)}`)
			.then(res => res.json())
			.then(body => body.categories[0]);
		if (!search) throw '<:crossmark:508590460688924693>  ::  Anime series not found!';

		const $ = cheerio.load(await fetch(search.items[0].url).then(res => res.text())); // eslint-disable-line id-length
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
