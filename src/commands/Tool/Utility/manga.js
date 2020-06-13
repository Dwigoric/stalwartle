const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

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
		await msg.send('<a:loading:430269209415516160>  ::  Loading manga...');
		const search = await fetch(`https://api.jikan.moe/v3/search/manga?q=${encodeURIComponent(keyword)}&limit=1`)
			.then(res => res.json())
			.then(body => body.results[0]);
		if (!search || (Array.isArray(search) && !search.length)) throw '<:error:508595005481549846>  ::  Manga not found!';

		const [manga] = search;

		msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(manga.title)
				.setThumbnail(manga.image_url)
				.setDescription(manga.synopsis)
				.setURL(manga.url)
				.addField('Volumes', manga.volumes, true)
				.addField('Chapters', manga.chapters, true)
				.addField('Score', manga.score, true)
		});
	}

};
