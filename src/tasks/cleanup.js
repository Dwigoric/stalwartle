const { Task, Colors } = require('klasa');
const { util: { binaryToID } } = require('discord.js');

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes
const THRESHOLD = 1000 * 60 * 30,
	EPOCH = 1420070400000,
	EMPTY = '0000100000000000000000';

module.exports = class MemorySweeper extends Task {

	constructor(...args) {
		super(...args);

		// The colors to stylise the console's logs
		this.colors = {
			red: new Colors({ text: 'lightred' }),
			yellow: new Colors({ text: 'lightyellow' }),
			green: new Colors({ text: 'green' })
		};

		// The header with the console colors
		this.header = new Colors({ text: 'lightblue' }).format('[CACHE CLEANUP]');
	}

	/* eslint complexity: ['warn', 25] */
	async run() {
		const OLD_SNOWFLAKE = binaryToID(((Date.now() - THRESHOLD) - EPOCH).toString(2).padStart(42, '0') + EMPTY);
		let guildMembers = 0,
			// presences = 0,
			// emojis = 0,
			lastMessages = 0,
			modlogs = 0,
			music = 0,
			users = 0;

		// Running garbage collection of Node.js
		if (global.gc) global.gc();

		// Per-Guild sweeper
		for (const guild of this.client.guilds.values()) {
			// Clear presences
			// presences += guild.presences.size;
			// guild.presences.clear();

			// Clear members that haven't send a message in the last 30 minutes
			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (member === me) continue;
				if (member === guild.owner) continue;
				if (member.voice.channelID) continue;
				if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
				if (member.user.settings.get('cookies')) continue;
				guildMembers++;
				guild.members.delete(id);
			}

			// Clear emojis
			// emojis += guild.emojis.size;
			// guild.emojis.clear();
		}

		// Per-Channel sweeper
		for (const channel of this.client.channels.values()) {
			if (!channel.lastMessageID) continue;
			channel.lastMessageID = null;
			lastMessages++;
		}

		// Per-User sweeper
		for (const user of this.client.users.values()) {
			if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
			if (user.settings.get('cookies')) continue;
			this.client.users.delete(user.id);
			this.client.gateways.users.cache.delete(user.id);
			users++;
		}

		// Modlog database sweeper
		for (const modlogDB of await this.client.providers.default.getAll('modlogs')) {
			if (modlogDB.modlogs.length) continue;
			this.client.providers.default.delete('modlogs', modlogDB.id);
			modlogs++;
		}

		// Music database sweeper
		for (const musicDB of await this.client.providers.default.getAll('music')) {
			if (musicDB.history.length) continue;
			if (musicDB.playlist.length) continue;
			if (musicDB.queue.length) continue;
			this.client.providers.default.delete('music', musicDB.id);
			music++;
		}

		// Emit a log
		this.client.emit('log', [
			this.header,
			// `${this.setColor(presences)} [Presence]s`,
			`${this.setColor(guildMembers)} [GuildMember]s`,
			`${this.setColor(users)} [User]s`,
			// `${this.setColor(emojis)} [Emoji]s`,
			`${this.setColor(lastMessages)} [Last Message]s`,
			`${this.setColor(modlogs)} [ModlogDB]s`,
			`${this.setColor(music)} [MusicDB]s`
		].join('\n'));

		// Create a schedule to make this task work
		while (this.client.schedule.tasks.filter(tk => tk.taskName === 'cleanup').length !== 1) {
			this.client.schedule.tasks.filter(tk => tk.taskName === 'cleanup').forEach(tk => this.client.schedule.delete(tk.id));
			await this.client.schedule.create('cleanup', '*/30 * * * *');
		}
	}

	async init() {
		this.run();
	}

	/**
	 * Set a colour depending on the amount:
	 * > 1000 : Light Red colour
	 * > 100  : Light Yellow colour
	 * < 100  : Green colour
	 * @since 3.0.0
	 * @param {number} number The number to colourise
	 * @returns {string}
	 */
	setColor(number) {
		const text = String(number).padStart(5, ' ');
		// Light Red color
		if (number > 1000) return this.colors.red.format(text);
		// Light Yellow color
		if (number > 100) return this.colors.yellow.format(text);
		// Green color
		return this.colors.green.format(text);
	}

};
