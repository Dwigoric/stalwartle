const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const maljs = require('maljs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ani'],
			description: 'Gets information of an anime series from MyAnimeList.',
			usage: '<Anime:string>'
		});
	}

	async run(msg, [query]) {
		const aniEmbed = new MessageEmbed(),
			res = await maljs.quickSearch(query, 'anime');

		if (res) {
			const anime = await res.anime[0].fetch();

			if (!anime) throw '<:redTick:399433440975519754>  ::  Anime series not found!';

			aniEmbed
				.setColor('RANDOM')
				.setTitle(anime.title)
				.setImage(anime.cover)
				.setDescription(anime.description)
				.setURL(`${anime.mal.url}${anime.path}`)
				.addField('Score', anime.score, true)
				.addField('Popularity', anime.popularity, true)
				.addField('Rank', anime.ranked, true);

			msg.send({ embed: aniEmbed });
		}
	}

};
