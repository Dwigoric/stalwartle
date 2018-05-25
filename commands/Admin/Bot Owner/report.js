const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 9,
			runIn: ['text'],
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
		if (repMsg.author.id !== this.client.user.id) return;
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(repUser.tag, repUser.displayAvatarURL())
			.addField('Submission', repMsg.content)
			.addField("High Lord's Comments", repCom.join(' '))
			.setFooter(`#${msg.channel.name} | ${msg.channel.guild.name}`)
			.setTimestamp();
		if (!msg.flags.deny) this.client.channels.get(reportChans[msg.channel.name]).send({ embed, files: repMsg.attachments.map(a => a.url) }).catch();
		repUser.send(`Your ${msg.channel.name.slice(0, -1).split('-').join(' ')} has been acknowledged by a high lord!`, { embed, files: repMsg.attachments.map(a => a.url) }).then(() => repMsg.delete());
		msg.delete();
		msg.send(`<:greenTick:399433439280889858>  ::  Report sent to **${repUser.tag}**.`).then(sent => {
			setTimeout(() => {
				sent.delete();
			}, 5000);
		});
	}

};
