const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');

class UserGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'userGateway',
            collection: 'users',
            defaults: schema.users
        });
    }

}

module.exports = UserGateway;
