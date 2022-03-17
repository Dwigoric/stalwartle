class CacheDataInstance {

    constructor(id, manager) {
        Object.defineProperty(this, 'id', { value: id });
        Object.defineProperty(this, 'manager', { value: manager });
    }

}

module.exports = CacheDataInstance;
