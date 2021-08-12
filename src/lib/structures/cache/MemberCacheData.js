const CacheDataInstance = require('./CacheDataInstance');

class MemberCacheData extends CacheDataInstance {

    constructor(id) {
        super(id);

        this.actions = [];
        this.messages = [];
    }

    addAction(action) {
        this.actions.push(action);
        setTimeout(() => {
            this.actions.shift();
        }, this.client.gateways.guilds.get(this.id).automod.options.quota.within * 60000);
    }

    resetActions() {
        this.actions = [];
    }

    addMessage(message) {
        this.messages.push(message);
        setTimeout(() => {
            this.messages.shift();
        }, this.client.gateways.guilds.get(this.id).automod.options.antiSpam.within * 1000);
    }

}

module.exports = MemberCacheData;
