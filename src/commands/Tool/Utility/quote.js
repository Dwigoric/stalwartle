const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['q'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Puts a certain message (given the message ID) in an embed, as if "quoting" the message.',
			usage: '<MessageID:string> [Channel:channel]',
			usageDelim: ' '
		});
	}

	async run(msg, [mssg, chan = msg.channel]) {
		const message = await chan.messages.fetch(mssg).catch(() => { throw `<:redTick:399433440975519754>  ::  \`${mssg}\` is not a valid message ID from ${chan}.`; });
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription([
				message.content,
				`[**⇶ Jump to Message**](https://discordapp.com/channels/${msg.guild.id}/${chan.id}/${message.id})`
			].join('\n\n'))
			.setFooter(`Quoted by ${msg.author.tag}`, msg.author.displayAvatarURL())
			.setTimestamp(new Date(message.createdTimestamp));
		const attachments = message.attachments.size ? message.attachments.filter(atch => {
			const filename = atch.file.name;
			return /.(png|gif|jpe?g|webp)/i.test(filename.slice(-1 * (filename.length - filename.lastIndexOf('.'))));
		}) : null;
		if (attachments && attachments.size) embed.setImage(attachments.first().url);
		return msg.send(embed);
	}

};
