const { Util: { mergeDefault } } = require('discord.js');

class Gateway {

    constructor(client, collection, defaults = {}) {
        Object.defineProperty(this, 'client', { value: client });

        this.cache = new Map();
        this.collection = collection;
        this.defaults = defaults;
    }

    get(id) {
        return this.cache.get(id) || this.defaults;
    }

    async update(id, obj) {
        if (typeof obj !== 'object') throw new TypeError('Expected an object to update');

        const { value } = await this.client.provider.update(this.collection, id, obj, true);
        this.cache.set(id, mergeDefault(this.defaults, value));
        return value;
    }

    async sync(id) {
        const doc = await this.client.provider.get(this.collection, id);
        if (!doc) return null;

        this.cache.set(id, mergeDefault(this.defaults, doc));
        return doc;
    }

    async delete(id) {
        await this.client.provider.delete(this.collection, id);
        this.cache.delete(id);
    }

    async init() {
        const docs = await this.client.provider.getKeys(this.collection);

        for (const doc of docs) this.cache.set(doc.id, mergeDefault(this.defaults, doc));
    }


}

module.exports = Gateway;
