const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ud'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Searches the Urban Dictionary library for a definition to the search term.',
			usage: '<SearchTerm:string> [resultNum:integer]',
			usageDelim: ', '
		});
	}

	async run(msg, [search, index = 1]) {
		await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading Urban definition...`);

		const params = new URLSearchParams();
		params.set('term', search);
		const body = await fetch(`http://api.urbandictionary.com/v0/define?${params}`).then(res => res.json());

		const result = body.list[index];
		if (!result) throw `${this.client.constants.EMOTES.xmark}  ::  No Urban Dictionary entry found.`;

		const definition = result.definition.length > 1000 ?
			`${this.splitText(result.definition, 1000)}...` :
			result.definition;

		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(`'${result.word}' as defined by ${result.author}`)
				.setURL(result.permalink)
				.setDescription(definition)
				.addField('Example', result.example.split('\n')[0])
				.addField('Rating', `**${result.thumbs_up}** 👍 | **${result.thumbs_down}** 👎`)
				.setFooter('Definition from Urban Dictionary')
				.setTimestamp()
		});
	}

	splitText(string, length, endBy = ' ') {
		const a = string.substring(0, length).lastIndexOf(endBy);
		const pos = a === -1 ? length : a;
		return string.substring(0, pos);
	}

};
