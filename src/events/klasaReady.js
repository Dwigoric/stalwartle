const { Event } = require('@sapphire/framework');

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
	{ name: 'Gravity Falls', type: 'WATCHING' },
	{ name: 'anime', type: 'WATCHING' },
	{ name: 'Spotify', type: 'LISTENING' },
	{ name: 'Pop Rock', type: 'LISTENING' },
	{ name: 'P!ATD', type: 'LISTENING' },
	{ name: 'Fall Out Boy', type: 'LISTENING' },
	{ name: 'Ariana Grande', type: 'LISTENING' }
];

module.exports = class extends Event {

	async run() {
		if (this.client.application.botPublic) this.client.postStats().then(() => this.client.setInterval(() => this.client.postStats(), 1000 * 60 * 5));
		this.client.user.setActivity('Just started running! 👀', { type: 'WATCHING' }).then(() => {
			this.client.setInterval(() => {
				const status = statuses[Math.floor(Math.random() * statuses.length)];
				this.client.user.setActivity(`${status.name} | ${this.client.options.prefix}help`, { type: status.type });
			}, 60000);
		});
	}

};
