const { Extendable, KlasaGuild } = require('klasa');
const { Player } = require('discord.js-lavalink');

module.exports = class GuildPlayer extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaGuild] });
	}

	get player() {
		const data = {
			guild: this.id,
			host: this.client.options.lavalinkNodes[0].host,
			channel: (this.channels.cache.filter(ch => ch.type === 'voice' && ch.members.has(this.me.id)) || { id: null }).id
		};
		const exists = this.client.playerManager.players.get(data.guild);
		if (exists) return exists;
		const node = this.client.playerManager.nodes.get(data.host);
		if (!node) throw new Error(`INVALID_HOST: No available node with ${data.host}`);
		const player = new Player(node, {
			id: data.guild,
			channel: data.channel
		});
		this.client.playerManager.players.set(data.guild, player);
		return player;
	}

};
