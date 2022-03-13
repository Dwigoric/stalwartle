const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');
const schemaTypes = require('../schemaTypes');

class GuildGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'guildGateway',
            collection: 'guilds',
            defaults: schema.guilds,
            defaultsTypes: schemaTypes.guilds
        });
    }

}

module.exports = GuildGateway;
