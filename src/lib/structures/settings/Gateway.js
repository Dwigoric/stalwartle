const { Piece } = require('@sapphire/pieces');
const { deepClone, makeObject, isObject, mergeDefault } = require('@sapphire/utilities');
const { isConfigurableSchema, isSchemaArray, getSchemaMinimum, getSchemaMaximum, getBaseSchemaType } = require('../../../schemaTypes');

class Gateway extends Piece {

    constructor(context, options) {
        super(context, options);

        this.cache = new Map();
        Object.defineProperty(this, 'collection', { value: options.collection, writable: false });
        Object.defineProperty(this, 'defaults', { value: options.defaults || {}, writable: false });
        Object.defineProperty(this, 'defaultsTypes', { value: options.defaultsTypes || {}, writable: false });
    }

    get(id, path, filterUnconfigurable = false) {
        let obj;

        if (typeof path === 'string') obj = objectValueByPath(this.get(id, undefined, filterUnconfigurable), path);
        else if (this.cache.has(id)) obj = mergeDefault(deepClone(this.defaults), this.cache.get(id));
        else obj = deepClone(this.defaults);

        return filterUnconfigurable ? this.#filterUnconfigurable(obj, path) : obj;
    }

    getType(path) {
        const type = objectValueByPath(this.defaultsTypes, path);
        if (!type) return null;
        return {
            type: getBaseSchemaType(type),
            isConfigurable: isConfigurableSchema(type),
            isArray: isSchemaArray(type),
            minimum: getSchemaMinimum(type),
            maximum: getSchemaMaximum(type)
        };
    }

    has(id) {
        return this.cache.has(id);
    }

    async update(id, path, val) {
        const obj = typeof path === 'string' ? makeObject(path, val) : path;

        await this.container.database.update(this.collection, id, mergeDefault(obj, { id }), true);
        return this.sync(id);
    }

    async sync(id) {
        const doc = await this.container.database.get(this.collection, id);
        if (!doc) return null;

        delete doc._id;
        delete doc.id;
        this.cache.set(id, doc);
        return doc;
    }

    async reset(id, path) {
        if (typeof path !== 'string') throw new TypeError('Expected the path to be a string');

        await this.container.database.reset(this.collection, id, makeObject(path, 1));
        return this.sync(id);
    }

    async delete(id) {
        await this.container.database.delete(this.collection, id);
        this.cache.delete(id);
    }

    async init() {
        if (!await this.container.database.hasTable(this.collection)) await this.container.database.createTable(this.collection);
        const docs = await this.container.database.getAll(this.collection);

        for (const doc of docs) {
            const { id } = doc;
            delete doc._id;
            delete doc.id;
            this.cache.set(id, doc);
        }
    }

    #filterUnconfigurable(obj, path) {
        if (obj === null) return null;
        if (!isObject(obj)) {
            if (this.getType(path).isConfigurable) return obj;
            return null;
        }

        const configurableObj = {};

        for (const [key, value] of Object.entries(obj)) {
            const type = this.getType(`${path || ''}.${key}`);
            if (type && type.isConfigurable) configurableObj[key] = value;
        }

        return configurableObj;
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
        else return null;
    }
    return obj;
}

module.exports = Gateway;
