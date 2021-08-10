const PersistenceManager = require('./PersistenceManager');
const Gateway = require('./Gateway');

const pm = new PersistenceManager();

module.exports = class GatewayManager {

	constructor() {
		this.pm = pm;
		this.connections = new Set();
	}

	async create(scope, defaults = {}) {
		if (!scope) throw new Error('No scope given.');

		if (!await this.pm.hasTable(scope)) this.pm.createTable(scope);

		const gateway = new Gateway(scope, defaults, this);
		this.connections.add(scope);
		this[scope] = gateway;
		return gateway;
	}

};
