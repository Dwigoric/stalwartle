const { Collection } = require('discord.js');
const DataStore = require('./DataStore');

module.exports = class Gateway {

	constructor(manager, client, type, schema, provider) {
		Object.defineProperty(this, 'client', { value: client });
		Object.defineProperty(this, 'type', { value: type });
		this.provider = provider;
		this.manager = manager;
		this.cache = new Collection();
		this.schema = schema;
		this.ready = false;
	}

	get defaults() {
		return { ...this.schema.defaults, default: true };
	}

	get DataStore() {
		return DataStore;
	}

	get(id, create = false) {
		const entry = this.cache.get(id);
		if (entry) return entry.settings;
		if (create) {
			const settings = new this.DataStore(this, { id });
			if (this._synced && this.schema.size) settings.sync(true).catch(err => this.client.emit('error', err));
			return settings;
		}
		return null;
	}

	getPath(key = '', { avoidUnconfigurable = false, piece: requestPiece = true, errors = true } = {}) {
		if (key === '' || key === '.') return { piece: this.schema, route: [] };
		const route = key.split('.');
		const piece = this.schema.get(route);

		// The piece does not exist (invalid or non-existent path)
		if (!piece) {
			if (!errors) return null;
			throw `The key ${key} does not exist in the schema.`;
		}

		if (requestPiece === null) requestPiece = piece.type !== 'Folder';

		// GetPath expects a piece
		if (requestPiece) {
			// The piece is a key
			if (piece.type !== 'Folder') {
				// If the Piece is unconfigurable and avoidUnconfigurable is requested, throw
				if (avoidUnconfigurable && !piece.configurable) {
					if (!errors) return null;
					throw `The key ${piece.path} is not configurable.`;
				}
				return { piece, route };
			}

			// The piece is a folder
			if (!errors) return null;
			const keys = avoidUnconfigurable ? piece.configurableKeys : [...piece.keys()];
			throw keys.length ? `Please, choose one of the following keys: '${keys.join('\', \'')}'` : 'This group is not configurable.';
		}

		// GetPath does not expect a piece
		if (piece.type !== 'Folder') {
			// Remove leading key from the path
			route.pop();
			return { piece: piece.parent, route };
		}

		return { piece, route };
	}

	async sync(input = [...this.cache.keys()]) {
		if (Array.isArray(input)) {
			if (!this._synced) this._synced = true;
			const entries = await this.provider.getAll(this.type, input);
			for (const entry of entries) {
				if (!entry) continue;
				const cache = this.get(entry.id);
				if (cache) {
					if (!cache._existsInDB) cache._existsInDB = true;
					cache._patch(entry);
				}
			}

			// Set all the remaining settings from unknown status in DB to not exists.
			for (const entry of this.cache.values()) {
				if (entry.settings._existsInDB === null) entry.settings._existsInDB = false;
			}
			return this;
		}

		const cache = this.get((input && input.id) || input);
		return cache ? cache.sync(true) : null;
	}

	async init() {
		// A gateway must not init twice
		if (this.ready) throw new Error(`[INIT] ${this} has already initialized.`);

		// Check the provider's existence
		const { provider } = this;
		if (!provider) throw new Error('Could not access your provider.');
		this.ready = true;

		const errors = [];
		for (const piece of this.schema.values(true)) {
			// Assign Client to all Pieces for Serializers && Type Checking
			piece.client = this.client;

			Object.freeze(piece);

			// Check if the piece is valid
			try {
				piece.isValid();
			} catch (error) {
				errors.push(error.message);
			}
		}

		if (errors.length) throw new Error(`[SCHEMA] There is an error with your schema.\n${errors.join('\n')}`);

		// Init the table
		const hasTable = await provider.hasTable(this.type);
		if (!hasTable) await provider.createTable(this.type);

		// Add any missing columns (NoSQL providers return empty array)
		const columns = await provider.getColumns(this.type);
		if (columns.length) {
			const promises = [];
			for (const [key, piece] of this.schema.paths) if (!columns.includes(key)) promises.push(provider.addColumn(this.type, piece));
			await Promise.all(promises);
		}
	}

	toJSON() {
		return {
			type: this.type,
			options: { provider: 'mongodb' },
			schema: this.schema.toJSON()
		};
	}

	toString() {
		return `Gateway(${this.type})`;
	}

};
