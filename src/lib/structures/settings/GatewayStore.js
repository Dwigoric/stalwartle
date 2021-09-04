const { AliasStore } = require('@sapphire/pieces');

class GatewayStore extends AliasStore {

    constructor(Gateway) {
        super(Gateway, { name: 'gateways' });
    }

}

module.exports = GatewayStore;
