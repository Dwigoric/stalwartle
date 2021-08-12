const { Extendable, KlasaGuild } = require('@sapphire/framework');

module.exports = class GuildPlayer extends Extendable {

    constructor(...args) {
        super(...args, { appliesTo: [KlasaGuild] });
    }

    get player() {
        return this.client.lavacord.players.get(this.id) || null;
    }

};
