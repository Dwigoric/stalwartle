const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');
const schemaTypes = require('../schemaTypes');

class MusicGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'musicGateway',
            collection: 'music',
            defaults: schema.music,
            defaultsTypes: schemaTypes.music
        });
    }

}

module.exports = MusicGateway;
