const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			event: 'voiceStateUpdate'
		});
	}

	async run(oldState, newState) {
		if (!this.client.playerManager) return null;
		if (!newState.guild.player) return null;
		if (!newState.guild.me.voice.channelID) this.client.playerManager.leave(newState.guild.id);
		if (oldState.channel && newState.channel && (oldState.channel.id === newState.channel.id || ![oldState.channel.id, newState.channel.id].includes(newState.guild.me.voice.channelID))) return null;

		const channelMembers = newState.guild.me.voice.channel.members.filter(mb => !mb.user.bot);
		if (newState.guild.player && !newState.guild.player.playing && !channelMembers.size) return this.client.playerManager.leave(newState.guild.id);
		if (newState.guild.me.voice.channelID && channelMembers.size) return newState.guild.player.pause(false);
		if (channelMembers.size) return null;
		const { queue } = await this.client.providers.default.get('music', newState.guild.id);
		if (!queue[0].info.isStream) newState.guild.player.pause(true);
		if (newState.guild.settings.get('donation') >= 10) return null;
		return this.client.setTimeout(guild => {
			if (guild.me.voice.channelID && guild.me.voice.channel.members.filter(mb => !mb.user.bot).size) return null;
			this.client.playerManager.leave(guild.id);
			if (queue[0].requester === this.client.user.id) this.client.providers.default.update('music', newState.guild.id, { queue: [] });
			return null;
		}, 30000, newState.guild);
	}

};
