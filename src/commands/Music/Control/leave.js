const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			runIn: ['text'],
			description: 'Makes the bot leave the voice channel, if connected to one.'
		});
	}

	async run(msg) {
		if (!msg.guild.me.voice.channel) throw `${this.client.constants.EMOTES.xmark}  ::  There is no music session in this server.`;
		this.store.get('play').timeouts.delete(msg.guild.id);
		this.client.playerManager.leave(msg.guild.id);
		const song = ((await this.client.providers.default.get('music', msg.guild.id) || {}).queue || [])[0];
		if (song && song.requester === this.client.user.id) this.client.providers.default.update('music', msg.guild.id, { queue: [] }); // eslint-disable-line max-len
		// eslint-disable-next-line max-len
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully left the voice channel.`);
	}

};
