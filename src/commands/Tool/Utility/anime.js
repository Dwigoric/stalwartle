const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

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
		const search = await fetch(`https://api.jikan.moe/v3/search/anime?q=${encodeURIComponent(keyword)}&limit=1`)
			.then(res => res.json())
			.then(body => body.results);
		if (!search.length) throw '<:error:508595005481549846>  ::  Anime series not found!';

		const [anime] = search;

		msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(anime.title)
				.setThumbnail(anime.image_url)
				.setDescription(anime.synopsis)
				.setURL(anime.url)
				.addField('Episodes', anime.episodes, true)
				.addField('Rating', anime.rated, true)
				.addField('Score', anime.score, true)
		});
	}

};
