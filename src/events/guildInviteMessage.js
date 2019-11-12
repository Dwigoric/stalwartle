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
			.setFooter(`${this.client.user.username} Added!`, this.client.user.displayAvatarURL())
			.setThumbnail(guild.iconURL({ size: 2048 }))
			.setTimestamp()
			.setDescription([
				`Hey there ${guild.owner}! Thank you for having me in **${guild.name}**. It is an honor to serve you.`,
				`\nTo get started, please use \`${guild.settings.get('prefix')}help\` here or on any text channel. You will be given a list of commands.`,
				`Please feel free to look at the command list. If you want me to serve more Discord users, just use the \`${guild.settings.get('prefix')}invite\` command!`,
				'\nI can play music, moderate users, send memes, manipulate user avatars, and more!',
				`\nBy **${this.client.application.owner.tag}**, from 🇵🇭 with ❤`,
				'\nThis message will be automatically deleted in 10 seconds.'
			].join('\n'));
		const postableChannel = guild.channels.filter(ch => ch.type === 'text' && ch.postable && ch.permissionsFor(guild.me).has('EMBED_LINKS')).first();
		if (!postableChannel) return guild.owner.user.sendEmbed(message).then(invMessage => setTimeout(() => { invMessage.delete(); }, 10000)).catch(() => null);
		return postableChannel.sendEmbed(message, guild.owner);
	}

};
