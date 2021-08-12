class CacheManager {

    constructor(client, instance) {
        Object.defineProperty(this, 'client', { value: client });

        this.cache = new Map();
        this.Instance = instance;
    }

    get(id) {
        return this.cache.get(id) || this.cache.set(id, new this.Instance(id)).get(id);
    }

}

module.exports = CacheManager;
