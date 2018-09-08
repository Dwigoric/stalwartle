const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run() {
		this.client.setGuildCount();
		const { restart } = this.client.settings;
		if (!restart) return;
		this.client.channels.get(restart).send({
			embed: new MessageEmbed()
				.setColor(0x40E0D0)
				.setTitle('Bot has successfully restarted!')
				.setThumbnail(this.client.user.displayAvatarURL())
				.setDescription(`**Creeping through Discord...**\nand doing some magic!\n\nCurrently running on **${this.client.guilds.size}** guilds with **${this.client.users.size}** users.`)
				.setTimestamp()
		});
		this.client.settings.reset('restart');
	}

};
