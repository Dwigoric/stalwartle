const PersistenceManager = require('./PersistenceManager');
const Gateway = require('./Gateway');
const Schema = require('./schema/Schema');

const provider = new PersistenceManager();

module.exports = class GatewayManager {

	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
		Object.defineProperty(this, '_queue', { value: [] });
		this.provider = provider;
		this.keys = new Set();
	}

	async register(type, schema = new Schema()) {
		if (!type) throw new Error('No type given.');

		if (!await this.provider.hasTable(type)) this.provider.createTable(type);

		const gateway = new Gateway(this, this.client, type, schema, this.provider);
		this.keys.add(type);
		this[type] = gateway;
		this._queue.push(gateway.init.bind(gateway));
		return this;
	}

	async init() {
		await Promise.all([...this._queue].map(fn => fn()));
		this._queue.length = 0;
	}

	sync() {
		return Promise.all([...this].map(([, gateway]) => gateway.sync()));
	}

	*[Symbol.iterator]() {
		for (const key of this.keys) yield [key, this[key]];
	}

	toJSON() {
		return {
			keys: [...this.keys],
			ready: this.ready,
			...Object.assign({}, [...this].map(([key, value]) => ({ [key]: value.toJSON() })))
		};
	}

	toString() {
		return `GatewayManager(${[...this.keys].join(', ')})`;
	}

};
