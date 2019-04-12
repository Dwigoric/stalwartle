const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['wiki'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Finds a Wikipedia Article by title.',
			usage: '<Query:string>'
		});
	}

	async run(msg, [query]) {
		await msg.send('<a:loading:430269209415516160>  ::  Loading Wikipedia article...');

		const article = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`).then(res => res.json());
		if (!article.content_urls) throw `<:error:508595005481549846>  ::  I couldn't find a wikipedia article with title **${query}**.`;

		msg.send({
			embed: await new MessageEmbed()
				.setColor('RANDOM')
				.setThumbnail((article.thumbnail && article.thumbnail.source) || 'https://i.imgur.com/fnhlGh5.png')
				.setURL(article.content_urls.desktop.page)
				.setTitle(article.title)
				.setDescription(article.extract)
		});
	}

};
