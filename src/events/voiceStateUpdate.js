const { Event } = require('klasa');

module.exports = class extends Event {

	run(oldState, newState) {
		if (!newState.guild.voiceConnection) return;
		if (newState.guild.me.voice.channel.members.filter(mb => mb.id !== newState.guild.me.id).size) return;
		this.client.setTimeout(voiceConnection => {
			if (voiceConnection.channel.members.filter(mb => mb.id !== voiceConnection.channel.guild.me.id).size) return;
			voiceConnection.dispatcher.destroy();
			voiceConnection.channel.leave();
		}, 30000, newState.guild.voiceConnection);
	}

};
