const { Event } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Event {

	async run(member) {
		const goodbye = member.guild.settings.get('goodbye');
		if (!goodbye.channel) return null;
		const chan = member.guild.channels.get(goodbye.channel);
		if (!chan) {
			member.guild.owner.user.send(`⚠  ::  The goodbye channel for ${member.guild.name} has been deleted. This setting has been reset.`).catch(() => null);
			return member.guild.settings.reset('goodbye');
		}
		if (!chan.postable) {
			member.guild.owner.user.send(`⚠  ::  I can't post to <#${chan.id}>, the goodbye channel for ${member.guild.name}.`).catch(() => null);
			return member.guild.settings.reset('goodbye');
		}
		const params = [];
		for (const [key, value] of Object.entries({
			type: 'goodbye',
			version: goodbye.version,
			message: encodeURIComponent(`We send regards to ${member.user.tag}`),
			bot: member.user.bot,
			avatar: member.user.displayAvatarURL({ size: 2048, format: 'png' }),
			username: encodeURIComponent(member.user.username),
			discriminator: member.user.discriminator,
			guildName: encodeURIComponent(member.guild.name),
			memberCount: member.guild.memberCount
		})) params.push(`${key}=${value}`);
		return chan.sendFile(Buffer.from(await fetch(`https://dev.anidiots.guide/greetings/unified?${params.join('&')}`, { headers: { Authorization: this.client.auth.idioticAPIkey } })
			.then(res => res.json())
			.then(buffer => buffer.data)), 'goodbye.png', `👋  ::  ${member.user.tag} has left the server.`);
	}

};
