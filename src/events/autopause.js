const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			event: 'voiceStateUpdate'
		});
	}

	async run(oldState, newState) {
		if (!this.client.player) return null;
		if (!newState.guild.me.voice.channelID) return null;
		if (newState.channel && newState.channel.id !== newState.guild.me.voice.channelID) return null;
		if (oldState.channel && oldState.channel.id !== newState.guild.me.voice.channelID) return null;
		if (oldState.channel && newState.channel && oldState.channel.id === newState.channel.id) return null;
		if (newState.guild.me.voice.channelID && newState.guild.me.voice.channel.members.filter(mb => !mb.user.bot).size) return newState.guild.player.pause(false);
		const { queue } = await this.client.providers.default.get('music', newState.guild.id);
		if (!queue[0].info.isStream) newState.guild.player.pause(true);
		if (newState.guild.settings.get('donation') >= 10) return null;
		return this.client.setTimeout(guild => {
			if (guild.me.voice.channelID && guild.me.voice.channel.members.filter(mb => !mb.user.bot).size) return null;
			this.client.player.leave(guild.id);
			if (queue[0].requester === this.client.user.id) this.client.providers.default.update('music', newState.guild.id, { queue: [] });
			return null;
		}, 30000, newState.guild);
	}

};
