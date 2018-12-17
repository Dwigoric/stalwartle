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
	}

	async init() {
		const { id, token } = this.client.settings.get('guildHook');
		this.hook = new WebhookClient(id, token);
	}

};
