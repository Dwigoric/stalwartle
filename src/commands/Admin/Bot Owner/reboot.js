const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['restart'],
			permissionLevel: 9,
			description: 'Restarts the bot, and then notifies in the same channel if the bot is up again.'
		});
	}

	async run(msg) {
		await this.client.settings.update([['restart.authority', msg.author.id], ['restart.timestamp', msg.createdTimestamp]]);
		await msg.sendLocale('COMMAND_REBOOT').catch(err => this.client.emit('error', err));
		await this.client.destroy();
		process.exit();
	}

	async init() {
		const { authority, timestamp } = await this.client.settings.get('restart');
		if (!authority) return;
		(await this.client.users.fetch(authority)).send({
			embed: new MessageEmbed()
				.setColor(0x40E0D0)
				.setTitle('Bot has successfully restarted!')
				.setThumbnail(this.client.user.displayAvatarURL())
				.setDescription(`**Creeping through Discord...**\nand doing some magic!\n\nCurrently running on **${await this.client.guildCount()}** guilds with **${await this.client.userCount()}** users.`) // eslint-disable-line max-len
				.setFooter(`Reboot duration: ${+`${`${Math.round(`${`${(Date.now() - timestamp) / 1000}e+2`}`)}e-2`}`}s`)
				.setTimestamp()
		});
		this.client.settings.reset(['restart.authority', 'restart.timestamp']);
	}

};
