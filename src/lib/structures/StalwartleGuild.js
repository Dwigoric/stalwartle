const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
	class StalwartleGuild extends Guild {

		constructor(...args) {
			super(...args);
			this.modlogs = this.client.gateways.modlogs.get(this.id, true);
			this.music = this.client.gateways.music.get(this.id, true);
		}

	}
	return StalwartleGuild;
});
