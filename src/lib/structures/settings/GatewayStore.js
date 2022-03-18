const { Store } = require('@sapphire/pieces');

class GatewayStore extends Store {

    constructor(Gateway) {
        super(Gateway, { name: 'gateways' });
    }

}

module.exports = GatewayStore;
