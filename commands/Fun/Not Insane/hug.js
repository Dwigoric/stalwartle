const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const { giphyAPIkey } = require('../../../auth');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['hugs'],
			runIn: ['text'],
			description: 'Gives a random hugging GIF.',
			usage: '<Person:member>'
		});
	}

	async run(msg, [person]) {
		const giphy = await snekfetch.get('http://api.giphy.com/v1/gifs/search')
			.query({
				q: 'anime hug', // eslint-disable-line id-length
				api_key: giphyAPIkey // eslint-disable-line camelcase
			});
		const gifPage = Math.floor(Math.random() * giphy.body.data.length);
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setImage(giphy.body.data[gifPage].images.original.url)
			.setFooter('Powered by GIPHY', 'https://78.media.tumblr.com/b508813ce2f04b27f1a6597ded1de623/tumblr_mrsdao4gWV1s5e5bko1_500.gif');
		msg.send(`🤗  ::  **${msg.member.displayName}** wants to hug ${person}!`, { embed });
	}

};
