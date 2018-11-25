const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	async run(msg, command) {
		if (!msg.guild) return;
		if (!this.client.commands.filter(cmd => cmd.category === 'Music' && cmd.subCategory === 'Control').has(command.name)) return;
		if (!await msg.hasAtLeastPermissionLevel(5)) return;
		if (!msg.guild.player.playing) return;
		const chan = msg.guild.channels.get(msg.guild.player.channel);
		if (!chan.members.has(msg.member.id)) throw `<:error:508595005481549846>  ::  You must be connected to #**${chan.name}** to be able to control the music session.`;
	}

};
