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
		[
			// ChillGalaxy
			'445823150626832386',
			// Insanity Bot Laboratory
			'401349122902458378'
		].forEach(chan => this.client.channels.get(chan).send({
			embed: new MessageEmbed()
				.setTitle(`<a:updating:417233654545383424> ${this.client.user.username}'s Changelog`)
				.setDescription(params)
				.setTimestamp()
		}));
		msg.send(`<:check:508590521342623764>  ::  Successfully posted changelog!`);
	}

};
