const { Structures } = require('discord.js');

module.exports = Structures.extend('User', User => {
	class StalwartleUser extends User {

		constructor(...args) {
			super(...args);
			this.afk = this.client.gateways.get('afk').create(this);
		}

	}
	return StalwartleUser;
});
