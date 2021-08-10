const PersistenceManager = require('./PersistenceManager');
const Gateway = require('./Gateway');

const pm = new PersistenceManager();

module.exports = class GatewayManager {

	constructor() {
		this.pm = pm;
		this.gateways = new WeakMap();
	}

	async create(scope, defaults) {
		if (!await this.pm.hasTable(scope)) this.pm.createTable(scope);
		const gateway = new Gateway(scope, defaults, this);
		this.gateways.set(scope, gateway);
		return gateway;
	}

};
