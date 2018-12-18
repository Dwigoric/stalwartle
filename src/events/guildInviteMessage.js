const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildCreate' });
	}

	async run(guild) {
		const message = new MessageEmbed()
			.setColor('#C62A29')
			.setAuthor('Thank you for having me!', guild.owner.user.displayAvatarURL())
			.setTitle(guild.name)
			.setFooter(`By **${this.client.application.owner.tag}**, from 🇵🇭 with ❤`, this.client.user.displayAvatarURL())
			.setThumbnail(guild.iconURL({ size: 2048 }))
			.setTimestamp()
			.setDescription([
				`Hey there ${guild.owner}! Thank you for having me in **${guild.name}**. It is an honor to serve you.`,
				`To begin using me, please use \`${guild.settings.get('prefix')}help\` here or on any text channel. You will be given a list of commands.`,
				`Please feel free to look at the command list. If you want me to serve more Discord users, just use the \`${guild.settings.get('prefix')}invite\` command!`,
				'\nI can play music, moderate users, send memes, manipulate user avatars, and more!'
			].join('\n'));
		const postableChannel = guild.channels.filter(ch => ch.type === 'text' && ch.postable).first();
		if (!postableChannel) return guild.owner.user.sendEmbed(message, guild.owner).catch(() => null);
		return postableChannel.sendEmbed(message, guild.owner);
	}

};
