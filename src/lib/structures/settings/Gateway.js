const { AliasPiece } = require('@sapphire/pieces');
const { mergeDefault, makeObject } = require('@sapphire/utilities');

class Gateway extends AliasPiece {

    constructor(context, options) {
        super(context, options);

        this.cache = new Map();
        this.collection = 'collection' in options ? options.collection : new Error('The MongoDB collection was not supplied.');
        Object.defineProperty(this, 'defaults', { value: options.defaults || {}, writable: false });
    }

    get(id, path) {
        if (typeof path === 'string') return objectValueByPath(this.get(id), path);
        if (this.cache.has(id)) return mergeDefault(this.defaults, this.cache.get(id));
        else return this.defaults;
    }

    async update(id, path, val) {
        if (typeof path !== 'string') throw new TypeError('Expected the string path of the object to update');

        const obj = makeObject(path, val);
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

    async reset(id, path) {
        if (typeof path !== 'string') throw new TypeError('Expected the path to be a string');

        return this.update(id, path, objectValueByPath(this.defaults, path));
    }

    async delete(id) {
        await this.container.client.provider.delete(this.collection, id);
        this.cache.delete(id);
    }

    async init() {
        if (!await this.container.client.provider.hasTable(this.collection)) await this.container.client.provider.createTable(this.collection);
        const docs = await this.container.client.provider.getKeys(this.collection);

        for (const doc of docs) this.cache.set(doc.id, doc);
    }


}

function objectValueByPath(obj, path) {
    // convert indices to properties
    path = path.replace(/\[(\w+)\]/g, '.$1');
    // strip leading dot
    path = path.replace(/^\./, '');

    const keys = path.split('.');
    for (const key of keys) {
        if (key in obj) obj = obj[key];
        else throw new ReferenceError('Path does not exist in object');
    }
    return obj;
}

module.exports = Gateway;
