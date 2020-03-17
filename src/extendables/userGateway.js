const { Extendable, KlasaUser } = require('klasa');

module.exports = class UserGatewayAccess extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaUser] });
	}

	get afk() {
		return this.client.gateways.afk.get(this.id, true);
	}

};
