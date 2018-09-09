const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run() {
		this.client.setGuildCount();
		this.client.user.setActivity('Just started running! 👀', { type: 'WATCHING' }).then(() => {
			const statusLoop = () => {
				setTimeout(() => {
					const statuses = [
						{ name: 'dead', type: 'PLAYING' },
						{ name: 'with your feelings', type: 'PLAYING' },
						{ name: 'with sparkling 🔥', type: 'PLAYING' },
						{ name: 'hide and seek', type: 'PLAYING' },
						{ name: 'bad code', type: 'LISTENING' },
						{ name: 'with magic', type: 'PLAYING' },
						{ name: 'Cops and Robbers', type: 'PLAYING' },
						{ name: 'Simon Says', type: 'PLAYING' },
						{ name: 'I Spy', type: 'PLAYING' },
						{ name: 'chess', type: 'PLAYING' },
						{ name: 'with a rubber duck', type: 'PLAYING' },
						{ name: 'your movements', type: 'WATCHING' },
						{ name: 'Stranger Things', type: 'WATCHING' },
						{ name: 'Steven Universe', type: 'WATCHING' },
						{ name: 'anime', type: 'WATCHING' },
						{ name: 'Spotify', type: 'LISTENING' },
						{ name: 'Pop Rock', type: 'LISTENING' },
						{ name: 'P!ATD', type: 'LISTENING' },
						{ name: 'Fall Out Boy', type: 'LISTENING' },
						{ name: 'Ariana Grande', type: 'LISTENING' },
						{ name: 'Little Mix', type: 'LISTENING' }
					];
					const status = statuses[Math.floor(Math.random() * statuses.length)];
					this.client.user.setActivity(`${status.name} | ${this.client.options.prefix}help`, { type: status.type });
					statusLoop();
				}, 60000);
			};
			setTimeout(() => { statusLoop(); }, 10000);
		});
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
