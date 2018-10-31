const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
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
		const search = await snekfetch.get('https://myanimelist.net/search/prefix.json')
			.query({
				type: 'anime',
				keyword
			}).then(res => res.body.categories[0]);
		if (!search) throw '<:redTick:399433440975519754>  ::  Anime series not found!';

		const $ = cheerio.load(await snekfetch.get(search.items[0].url).then(res => res.body.toString())); // eslint-disable-line id-length
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
