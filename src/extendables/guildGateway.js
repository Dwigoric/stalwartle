const { Extendable, KlasaGuild } = require('klasa');

module.exports = class GuildGatewayAccess extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaGuild] });
	}

	get modlogs() {
		return this.client.gateways.modlogs.get(this.id, true);
	}

	get music() {
		return this.client.gateways.music.get(this.id, true);
	}

};
