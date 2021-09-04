const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');

class MusicGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'musicGateway',
            collection: 'music',
            defaults: schema.music
        });
    }

}

module.exports = MusicGateway;
