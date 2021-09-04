const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');

class AFKGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'afkGateway',
            collection: 'afk',
            defaults: schema.afk
        });
    }

}

module.exports = AFKGateway;
