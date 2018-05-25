const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Makes the bot say anything you want.',
			usage: '[delete|embed|anonymous] [Channel:channel] <Content:string{1,1000}> [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(msg, [chan = msg.channel, ...msgargs]) {
		msgargs = msgargs.join(this.usageDelim);
		if (!chan.postable) throw '<:redTick:399433440975519754>  ::  Sorry! I cannot send messages in that channel.'; // eslint-disable-line max-len
		if (chan !== msg.channel) msg.send(`<:greenTick:399433439280889858>  ::  Message sent!`);
		return chan.send(msgargs);
	}

	async delete(msg, [chan = msg.channel, ...msgargs]) {
		msgargs = msgargs.join(this.usageDelim);
		if (!chan.postable) throw '<:redTick:399433440975519754>  ::  Sorry! I cannot send messages in that channel.'; // eslint-disable-line max-len
		if (chan !== msg.channel) msg.send(`<:greenTick:399433439280889858>  ::  Message sent!`);
		chan.send(msgargs);
		return msg.delete();
	}

	async embed(msg, [chan = msg.channel, ...msgargs]) {
		msgargs = msgargs.join(this.usageDelim);
		if (!chan.postable) throw '<:redTick:399433440975519754>  ::  Sorry! I cannot send messages in that channel.'; // eslint-disable-line max-len
		if (chan !== msg.channel) msg.send(`<:greenTick:399433439280889858>  ::  Message sent!`);
		return chan.send({
			embed: await new MessageEmbed()
				.setColor(0x40E0D0)
				.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
				.setDescription(msgargs)
				.setFooter(`From #${msg.channel.name}`)
				.setTimestamp()
		});
	}

	async anonymous(msg, [chan = msg.channel, ...msgargs]) {
		msgargs = msgargs.join(this.usageDelim);
		if (!chan.postable) throw '<:redTick:399433440975519754>  ::  Sorry! I cannot send messages in that channel.'; // eslint-disable-line max-len
		if (chan !== msg.channel) msg.send(`<:greenTick:399433439280889858>  ::  Message sent!`);
		chan.send({
			embed: await new MessageEmbed()
				.setColor(0x40E0D0)
				.setAuthor('Anonymous User')
				.setDescription(msgargs)
				.setFooter(`From #${msg.channel.name}`)
				.setTimestamp()
		});
		return msg.delete();
	}

};
