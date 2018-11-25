const { Event } = require('klasa');

module.exports = class extends Event {

	run(oldState, newState) {
		if (!this.client.player) return;
		if (!newState.guild.player.channel) return;
		if (newState.guild.channels.get(newState.guild.player.channel).members.filter(mb => !mb.user.bot).size) return;
		newState.guild.player.pause(true);
		this.client.setTimeout(guild => {
			if (guild.player.channel && guild.channels.get(guild.player.channel).members.filter(mb => !mb.user.bot).size) return;
			this.client.player.leave(guild.id);
		}, 30000, newState.guild);
	}

};
