const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
	class StalwartleGuild extends Guild {

		constructor(...args) {
			super(...args);
			this.modlogs = this.client.gateways.get('modlogs').create(this);
			this.music = this.client.gateways.get('music').create(this);
		}

	}
	return StalwartleGuild;
});
