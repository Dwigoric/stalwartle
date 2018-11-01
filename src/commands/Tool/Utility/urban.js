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
		const body = await fetch(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(search)}`).then(res => res.json());

		const definition = this.getDefinition(search, body, --index);
		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor('Urban Dictionary')
				.setDescription(definition)
				.setTimestamp()
		});
	}

	getDefinition(search, body, index) {
		const result = body.list[index];
		if (!result) throw `<:redTick:399433440975519754>  ::  No entry found for **${search}**.`;

		const wdef = result.definition.length > 1000 ?
			`${this.splitText(result.definition, 1000)}...` :
			result.definition;

		return [
			`**Word:** [${result.word}](${result.permalink})`,
			`\n**Definition:** ${index + 1} out of ${body.list.length}\n_${wdef}_`,
			`\n**Example:**\n${result.example}`,
			`\n**${result.thumbs_up}** 👍 | **${result.thumbs_down}** 👎`,
			`\n*By ${result.author}*`
		].join('\n');
	}

	splitText(string, length, endBy = ' ') {
		const a = string.substring(0, length).lastIndexOf(endBy);
		const pos = a === -1 ? length : a;
		return string.substring(0, pos);
	}

};
