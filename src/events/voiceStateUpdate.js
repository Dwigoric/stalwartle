const { Event } = require('klasa');

module.exports = class extends Event {

	run(oldState, newState) {
		if (!newState.guild.player.channel || !newState.guild.player.playing) return;
		if (newState.guild.channels.get(newState.guild.player.channel).members.filter(mb => !mb.user.bot).size) return;
		this.client.setTimeout(guild => {
			if (guild.channels.get(guild.player.channel).members.filter(mb => !mb.user.bot).size) return;
			this.client.player.leave(guild.id);
		}, 30000, newState.guild);
	}

};
