const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const maljs = require('maljs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['man'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gets information of a manga series from MyAnimeList.',
			usage: '<Manga:string>'
		});
	}

	async run(msg, [query]) {
		const aniEmbed = new MessageEmbed(),
			res = await maljs.quickSearch(query, 'manga');

		if (res) {
			const manga = await res.manga[0].fetch();

			if (!manga) throw '<:redTick:399433440975519754>  ::  Manga not found!';

			aniEmbed
				.setColor('RANDOM')
				.setTitle(manga.title)
				.setImage(manga.cover)
				.setDescription(manga.description)
				.setURL(`${manga.mal.url}${manga.path}`)
				.addField('Score', manga.score, true)
				.addField('Popularity', manga.popularity, true)
				.addField('Rank', manga.ranked, true);

			msg.send({ embed: aniEmbed });
		}
	}

};
