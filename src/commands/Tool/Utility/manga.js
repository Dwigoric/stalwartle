const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['man'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gets information of a manga series from MyAnimeList.',
			usage: '<Manga:string>'
		});
	}

	async run(msg, [keyword]) {
		const search = await fetch(`https://myanimelist.net/search/prefix.json?type=manga&keyword=${encodeURIComponent(keyword)}`)
			.then(res => res.json())
			.then(body => body.categories[0]);
		if (!search) throw '<:redTick:399433440975519754>  ::  Manga not found!';

		const $ = cheerio.load(await fetch(search.items[0].url).then(res => res.text())); // eslint-disable-line id-length
		const manga = {
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
				.setTitle(manga.title)
				.setThumbnail(manga.cover)
				.setDescription(manga.description)
				.setURL(manga.url)
				.addField('Score', manga.score, true)
				.addField('Popularity', manga.popularity, true)
				.addField('Rank', manga.ranked, true)
		});
	}

};
