const { Event } = require('klasa');
const { WebhookClient, MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

const gregion = {
	'eu-central': 'Central Europe',
	'eu-west': 'Western Europe',
	hongkong: 'Hong Kong',
	'us-west': 'Western US',
	'us-east': 'Eastern US',
	'us-south': 'Southern US',
	'us-central': 'Central US'
};

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildCreate' });
		this.hook = null;
	}

	async run(guild) {
		const regionArr = guild.region.split('-');
		if (regionArr.includes('vip')) regionArr.splice(regionArr.indexOf('vip'), 1);
		const rawRegion = regionArr.join('-');
		let region = gregion[rawRegion] || rawRegion.replace(/^./, i => i.toUpperCase());
		if (guild.region.includes('vip')) region += ' [Partnered]';

		this.hook.send(new MessageEmbed()
			.setColor(0x2ECC71)
			.setAuthor("I've been added to a new server!", guild.owner.user.displayAvatarURL())
			.setThumbnail(guild.iconURL({ format: 'png' }))
			.setTitle(`${escapeMarkdown(guild.name)}  |  ${guild.id}`)
			.addField('Guild Owner', `${guild.owner.user.tag}\n(${guild.owner.user})`, true)
			.addField('Guild Region', region, true)
			.addField('Large Guild', guild.large ? '✅' : '❌', true)
			.addField('Verified Guild', guild.verified ? '✅' : '❌', true)
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
