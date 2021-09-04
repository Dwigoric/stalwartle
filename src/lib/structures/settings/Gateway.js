const { AliasPiece } = require('@sapphire/pieces');
const { Util: { mergeDefault } } = require('discord.js');

class Gateway extends AliasPiece {

    constructor(context, options) {
        super(context, options);

        this.cache = new Map();
        this.collection = 'collection' in options ? options.collection : new Error('The MongoDB collection was not supplied.');
        this.defaults = options.defaults || {};
    }

    get(id) {
        return this.cache.get(id) || this.defaults;
    }

    async update(id, obj) {
        if (typeof obj !== 'object') throw new TypeError('Expected an object to update');

        const { value } = await this.container.client.provider.update(this.collection, id, obj, true);
        this.cache.set(id, mergeDefault(this.defaults, value));
        return value;
    }

    async sync(id) {
        const doc = await this.container.client.provider.get(this.collection, id);
        if (!doc) return null;

        this.cache.set(id, mergeDefault(this.defaults, doc));
        return doc;
    }

    async delete(id) {
        await this.container.client.provider.delete(this.collection, id);
        this.cache.delete(id);
    }

    async init() {
        if (!await this.container.client.provider.hasTable(this.collection)) await this.container.client.provider.createTable(this.collection);
        const docs = await this.container.client.provider.getKeys(this.collection);

        for (const doc of docs) this.cache.set(doc.id, mergeDefault(this.defaults, doc));
    }


}

module.exports = Gateway;
