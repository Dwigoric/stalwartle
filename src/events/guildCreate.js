const { Event } = require('klasa');
const { WebhookClient, MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args);
		this.hook = null;
	}

	async run(guild) {
		this.client.setGuildCount();
		this.hook.send(new MessageEmbed()
			.setColor(0x2ECC71)
			.setAuthor("I've been added to a new server!", guild.owner.user.displayAvatarURL())
			.setThumbnail(guild.iconURL({ format: 'png' }))
			.setTitle(`${escapeMarkdown(guild.name)}  |  ${guild.id}`)
			.addField('Guild Owner', `${guild.owner.user.tag} (${guild.owner.user})`)
			.addField('Large Guild', guild.large ? '✅' : '❌', true)
			.addField('Guild Members', guild.memberCount, true)
			.addField('New Guild Count', await this.client.guildCount(), true)
			.setTimestamp()
		);

		const message = new MessageEmbed()
			.setColor('#C62A29')
			.setAuthor('Thank you for having me!', guild.owner.user.displayAvatarURL())
			.setTitle(guild.name)
			.setFooter(`${this.client.user.username} Added!`, this.client.user.displayAvatarURL())
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

	async init() {
		const { id, token } = this.client.settings.get('guildHook');
		this.hook = new WebhookClient(id, token);
	}

};
