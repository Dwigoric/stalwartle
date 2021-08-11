const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
	class StalwartleGuild extends Guild {

		constructor(...args) {
			super(...args);

			this.voteskips = [];
			this.music = this.client.gateways.music.get(this.id, true);
			this.modlogs = this.client.gateways.modlogs.get(this.id, true);

			this.music.sync(true);
			this.modlogs.sync(true);
		}

	}
	return StalwartleGuild;
});
