const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');

class ClientGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'clientGateway',
            collection: 'clientStorage',
            defaults: schema.client
        });
    }

}

module.exports = ClientGateway;
