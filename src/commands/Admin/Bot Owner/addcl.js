const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['addchangelog'],
			permissionLevel: 9,
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Posts a changelog in the changelog channel on the support server.',
			usage: '<Content:string>'
		});
	}

	async run(msg, ...params) {
		this.client.channels.get(this.client.settings.get('changelogs')).send({
			embed: new MessageEmbed()
				.setTitle(`<a:updating:417233654545383424> ${this.client.user.username}'s Changelog`)
				.setDescription(params)
				.setTimestamp()
		});
		msg.send(`<:check:508594899117932544>  ::  Successfully posted changelog!`);
	}

};
