const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	async run(msg, command) {
		if (!msg.guild) return;
		if (command.category !== 'Music' && command.subCategory !== 'Control') return;
		if (!await msg.hasAtLeastPermissionLevel(5) && command.name !== 'skip') throw '<:error:508595005481549846>  ::  Only DJs with the set DJ role can control music sessions.';
		if (!msg.guild.player.channel) return;
		const chan = msg.guild.channels.get(msg.guild.player.channel);
		if (!chan.members.has(msg.member.id)) throw `<:error:508595005481549846>  ::  You must be connected to #**${chan.name}** to be able to control the music session.`;
	}

};
