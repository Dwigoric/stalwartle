const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');
const schemaTypes = require('../schemaTypes');

class ModlogGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'modlogGateway',
            collection: 'modlogs',
            defaults: schema.modlogs,
            defaultsTypes: schemaTypes.modlogs
        });
    }

}

module.exports = ModlogGateway;
