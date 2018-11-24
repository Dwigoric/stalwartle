const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['CONNECT', 'SPEAK'],
			description: 'Makes the bot join a voice channel.'
		});
	}

	async run(msg) {
		if (!msg.member.voice.channel) throw '<:error:508595005481549846>  ::  Please connect to a voice channel first.';
		if (!msg.member.voice.channel.permissionsFor(msg.guild.me.id).has(['CONNECT', 'SPEAK'])) throw `<:error:508595005481549846>  ::  I do not have the required permissions (**Connect**, **Speak**) to play music in #**${msg.member.voice.channel.name}**.`; // eslint-disable-line max-len
		if (msg.guild.player.channel === msg.member.voice.channel.id) throw '<:error:508595005481549846>  ::  I\'m already connected to this voice channel.';
		const chan = msg.guild.channels.get(msg.guild.player.channel);
		if (msg.guild.player.playing && chan && !chan.members.has(msg.member.id)) throw `<:error:508595005481549846>  ::  There's already a music session in #${chan.name}.`;
		this.client.player.leave(msg.guild.id);
		this.client.player.join({
			host: this.client.options.nodes[0].host,
			guild: msg.guild.id,
			channel: msg.member.voice.channel.id
		}, { selfdeaf: true });
		return msg.send(`🎤  ::  Successfully joined #**${msg.member.voice.channel.name}**.`);
	}

};
