const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');
const schemaTypes = require('../schemaTypes');

class UserGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'userGateway',
            collection: 'users',
            defaults: schema.users,
            defaultsTypes: schemaTypes.users
        });
    }

}

module.exports = UserGateway;
