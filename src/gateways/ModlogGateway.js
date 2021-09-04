const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');

class ModlogGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'modlogGateway',
            collection: 'modlogs',
            defaults: schema.modlogs
        });
    }

}

module.exports = ModlogGateway;
