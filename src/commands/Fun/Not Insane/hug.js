const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['hugs'],
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gives a random hugging GIF.',
			usage: '<Person:member>'
		});
	}

	async run(msg, [person]) {
		await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading GIF...`);

		const params = new URLSearchParams();
		params.set('api_key', this.client.auth.giphyAPIkey);
		params.set('q', 'anime hug');
		const { data } = await fetch(`http://api.giphy.com/v1/gifs/search?${params}`)
			.then(res => res.json());
		const gifPage = Math.floor(Math.random() * data.length);
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setImage(data[gifPage].images.original.url)
			.setFooter('Powered by GIPHY', 'https://78.media.tumblr.com/b508813ce2f04b27f1a6597ded1de623/tumblr_mrsdao4gWV1s5e5bko1_500.gif');
		return msg.send(`🤗  ::  **${msg.member.displayName}** wants to hug ${person}!`, { embed });
	}

};
