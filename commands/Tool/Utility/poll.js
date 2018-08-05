const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Creates a poll in the current channel or in the channel you specify.',
			runIn: ['text'],
			usage: '[Channel:channel] <Poll:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [chan = msg.channel, ...details]) {
		details = details.join(this.usageDelim);

		if (!chan.postable) throw `<:redTick:399433440975519754>  ::  Sorry! I cannot send messages in that channel.`;
		if (!chan.permissionsFor(msg.author).has('VIEW_CHANNEL', true)) throw `<:redTick:399433440975519754>  ::  It seems you cannot send messages in that channel...`; // eslint-disable-line max-len
		if (chan !== msg.channel) msg.send(`<:greenTick:399433439280889858>  ::  Poll created!`);

		chan.send({
			embed: new MessageEmbed()
				.setColor(0x40E0D0)
				.setAuthor('Poll Created', msg.author.displayAvatarURL())
				.setDescription(details)
				.setFooter(`Poll started by ${msg.author.tag}`)
				.setTimestamp()
		}).then(sent => ['399433439280889858', '399433440975519754', '🤷'].forEach(reaction => sent.react(reaction)));
	}

};
