const { Event } = require('klasa');

module.exports = class extends Event {

	run(oldState, newState) {
		if (!this.client.player) return null;
		if (!newState.guild.player.channel) return null;
		if (oldState.channel && oldState.channel.id !== oldState.guild.player.channel && newState.channel && newState.channel.id !== newState.guild.player.channel) return null;
		if (newState.guild.channels.get(newState.guild.player.channel).members.filter(mb => !mb.user.bot).size) return newState.guild.player.pause(false);
		newState.guild.player.pause(true);
		return this.client.setTimeout(guild => {
			if (guild.player.channel && guild.channels.get(guild.player.channel).members.filter(mb => !mb.user.bot).size) return null;
			return this.client.player.leave(guild.id);
		}, 30000, newState.guild);
	}

};
