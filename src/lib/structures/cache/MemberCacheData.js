const CacheDataInstance = require('./CacheDataInstance');

class MemberCacheData extends CacheDataInstance {

    constructor(id, manager) {
        super(id, manager);

        this.actions = [];
        this.messages = [];
    }

    addAction(action) {
        this.actions.push(action);
        setTimeout(() => {
            this.actions.shift();
        }, this.manager.client.stores.get('gateways').get('guildGateway').get(this.id).automod.options.quota.within * 60000);
    }

    resetActions() {
        this.actions = [];
    }

    addMessage(message) {
        this.messages.push(message);
        setTimeout(() => {
            this.messages.shift();
        }, this.manager.client.stores.get('gateways').get('guildGateway').get(this.id).automod.options.antiSpam.within * 1000);
    }

}

module.exports = MemberCacheData;
