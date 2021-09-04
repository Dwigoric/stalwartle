const Gateway = require('../lib/structures/settings/Gateway');
const schema = require('../schema');

class GuildGateway extends Gateway {

    constructor(context) {
        super(context, {
            name: 'guildGateway',
            collection: 'guilds',
            defaults: schema.guilds
        });
    }

}

module.exports = GuildGateway;
