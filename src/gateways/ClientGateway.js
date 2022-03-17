const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');
const schemaTypes = require('../schemaTypes');

class ClientGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'clientGateway',
            collection: 'clientStorage',
            defaults: schema.client,
            defaultsTypes: schemaTypes.client
        });
    }

}

module.exports = ClientGateway;
