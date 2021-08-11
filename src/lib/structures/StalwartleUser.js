const { Structures } = require('discord.js');

module.exports = Structures.extend('User', User => {
	class StalwartleUser extends User {

		constructor(...args) {
			super(...args);

			this.afk = this.client.gateways.afk.get(this.id, true);

			this.afk.sync(true);
		}

	}
	return StalwartleUser;
});
