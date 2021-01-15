const { Extendable, KlasaGuild } = require('klasa');

module.exports = class GuildPlayer extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaGuild] });
	}

	get player() {
		return this.client.playerManager.players.get(this.id) || null;
	}

};
