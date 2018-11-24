const { Extendable, KlasaGuild } = require('klasa');

module.exports = class GuildPlayer extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaGuild] });
	}

	get player() {
		return this.client.player.spawnPlayer({
			guild: this.id,
			host: this.client.options.nodes[0].host,
			channel: (this.channels.filter(ch => ch.type === 'voice' && ch.members.has(this.me.id)) || { id: null }).id
		});
	}

};
