const { Event } = require('klasa');
const { WebhookClient, MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildCreate' });
		this.hook = null;
	}

	async run(guild) {
		// Clear cache
		guild.members.cache.clear();
		guild.presences.cache.clear();
		guild.emojis.cache.clear();

		this.hook.send(new MessageEmbed()
			.setColor(0x2ECC71)
			.setAuthor("I've been added to a new server!", await guild.members.fetch(guild.ownerID).then(owner => owner.user.displayAvatarURL({ dynamic: true })))
			.setThumbnail(guild.iconURL({ dynamic: true, format: 'png' }))
			.setTitle(`${escapeMarkdown(guild.name)}  |  ${guild.id}`)
			.addField('Guild Owner', `${guild.owner.user.tag}\n(${guild.owner.user})`, true)
			.addField('Large Guild', guild.large ? '✅' : '❌', true)
			.addField('Verified Guild', guild.verified ? '✅' : '❌', true)
			.addField('Guild Members', guild.memberCount, true)
			.addField('New Guild Count', await this.client.guildCount(), true)
			.setTimestamp()
		);
	}

	async init() {
		const { id, token } = await this.client.settings.get('guildHook');
		this.hook = new WebhookClient(id, token);
	}

};
