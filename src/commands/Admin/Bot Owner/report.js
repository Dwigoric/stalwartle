const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 9,
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Replies to a bug report or a suggestion.',
			extendedHelp: 'To deny, just add the flag `--deny`. It will not send to the resulting channel.',
			usage: '<User:user> <Message:message> <Comment:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [repUser, repMsg, ...repCom]) {
		const reportChans = {
			'magical-ideas': '445822516364181535',
			'magical-bugs': '445822556214394880'
		};
		if (repMsg.author.id !== this.client.user.id) return null;
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(repUser.tag, repUser.displayAvatarURL())
			.addField('Submission', repMsg.content)
			.addField("High Lord's Comments", repCom.join(' '))
			.setTimestamp();
		const attachments = repMsg.attachments.size ? repMsg.attachments.filter(atch => {
			const filename = atch.file.name;
			return /.(png|gif|jpe?g|webp)/i.test(filename.slice(-1 * (filename.length - filename.lastIndexOf('.'))));
		}) : null;
		if (attachments && attachments.size) embed.setImage(attachments.first().url);
		if (!msg.flags.deny) this.client.channels.get(reportChans[msg.channel.name]).send(embed).catch();
		msg.delete();
		msg.send(`<:check:508594899117932544>  ::  Report sent to **${repUser.tag}**.`).then(sent => {
			setTimeout(() => {
				sent.delete();
			}, 5000);
		});
		return repUser.send(`Your ${msg.channel.name.slice(0, -1).split('-').join(' ')} has been acknowledged by a high lord!`, { embed })
			.then(() => repMsg.delete())
			.catch(() => null);
	}

};
