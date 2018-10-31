const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const cheerio = require('cheerio');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gets a random FML story.'
		});
	}

	async run(msg) {
		const res = await snekfetch.get('http://www.fmylife.com/random');
		const $ = cheerio.load(res.text); // eslint-disable-line id-length

		const embed = new MessageEmbed()
			.setTitle(`Requested by ${msg.author.tag}`)
			.setAuthor('FML Stories')
			.setColor('RANDOM')
			.setTimestamp()
			.setDescription(`_${$('.block a').eq(0).text().trim()}\n\n_`)
			.addField('I agree, your life sucks', $('.vote-up').eq(0).text(), true)
			.addField('You deserved it:', $('.vote-down').eq(0).text(), true);

		if ($('.block a').length < 5) {
			throw '<:akcry:333597917342466048>  ::  Today, something went wrong, so you will have to try again in a few moments. FML again.';
		}

		msg.send({ embed });
	}

};
