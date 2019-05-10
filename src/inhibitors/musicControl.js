const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	async run(msg, command) {
		if (!msg.guild) return;
		if (command.category !== 'Music' || (command.category === 'Music' && command.subCategory !== 'Control')) return;
		if (!msg.guild.me.voice.channelID) return;
		if (!msg.guild.me.voice.channel.members.has(msg.member.id)) throw `<:error:508595005481549846>  ::  You must be connected to #**${msg.guild.me.voice.channel.name}** to be able to control the music session.`; // eslint-disable-line max-len
	}

};
