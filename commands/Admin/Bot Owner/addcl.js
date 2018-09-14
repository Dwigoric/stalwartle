const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['addchangelog'],
			permissionLevel: 9,
			description: 'Posts a changelog in the changelog channel on the support server.',
			usage: '<Content:string>'
		});
	}

	async run(msg, ...params) {
		const avatarURL = this.client.user.displayAvatarURL();
		[
			// ChillGalaxy
			'489811169952137218',
			// Insanity Bot Laboratory
			'401349122902458378'
		].forEach(chan => this.client.channels.get(chan).send({
			embed: new MessageEmbed()
				.setTitle(`<a:updating:417233654545383424> ${this.client.user.username}'s Changelog`)
				.setDescription(params)
				.setFooter(`Version ${require('../../../package.json').version}`, avatarURL)
				.setTimestamp()
		}));
		msg.send(`<:greenTick:399433439280889858>  ::  Successfully posted changelog!`);
	}

};
