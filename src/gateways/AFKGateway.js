const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');
const schemaTypes = require('../schemaTypes');

class AFKGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'afkGateway',
            collection: 'afk',
            defaults: schema.afk,
            defaultsTypes: schemaTypes.afk
        });
    }

}

module.exports = AFKGateway;
