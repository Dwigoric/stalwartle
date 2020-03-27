const { Structures } = require('discord.js');

module.exports = Structures.extend('Guild', Guild => {
	class StalwartleGuild extends Guild {

		constructor(...args) {
			super(...args);
			this.voteskips = [];
		}

	}
	return StalwartleGuild;
});
