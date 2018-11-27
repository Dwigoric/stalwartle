const { Event } = require('klasa');
const { WebhookClient, MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args);
		this.hook = null;
	}

	async run(guild) {
		this.client.setGuildCount();
		this.hook.send(new MessageEmbed()
			.setColor(0xE74C3C)
			.setAuthor("I've been removed from a server", guild.owner.user.displayAvatarURL())
			.setThumbnail(guild.iconURL({ format: 'png' }))
			.setTitle(`${guild.name}  |  ${guild.id}`)
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
