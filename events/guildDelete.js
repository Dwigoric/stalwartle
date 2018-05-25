const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	run(guild) {
		this.client.setGuildCount();
		this.client.channels.get('381728217104515074').send({
			embed: new MessageEmbed()
				.setColor(0xE74C3C)
				.setAuthor("I've been removed from a server", guild.owner.user.displayAvatarURL())
				.setThumbnail(`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`)
				.setTitle(`${guild.name}  |  ${guild.id}`)
				.addField('Guild Owner', `${guild.owner.user.tag} (${guild.owner.user})`)
				.addField('Guild Count', this.client.guilds.size, true)
				.addField('Channel Count', this.client.channels.size, true)
				.addField('User Count', this.client.users.size, true)
				.setTimestamp()
		});
	}

};
