const { Event, Duration, util: { toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');

const configs = {
	kick: ['#FBA200', '👢'],
	ban: ['#800000', '<:blobBan:399433444670701568>'],
	softban: ['#3498DB', '❌💬'],
	unban: ['#B5CD3B', '<:blobok:398843279665528843>'],
	mute: ['#FFD700', '<:blobstop:446987757651361813>'],
	unmute: ['#24E4D0', '<:blobgo:398843278243528707>'],
	warn: ['#B2884D', '<:blobthinkstare:398843280135028738>']
};

module.exports = class extends Event {

	async run(message, user, reason, duration) {
		this.checkAutomodQuota(message, await message.guild.members.fetch(user.id).catch(() => null));
		user
			.send(`You have been ${message.command.name}${message.command.name.slice(-3) === 'ban' ? 'n' : ''}${message.command.name.slice(-1) === 'e' ? '' : 'e'}d in **${message.guild}**. ${reason ? `**Reason**: ${reason}` : ''}`) // eslint-disable-line max-len
			.catch(() => {
				if (message.command.name === 'warn' && message.author) message.send(`⚠ I couldn't send messages to **${user.tag}**, so I couldn't warn them; but this will still be logged.`);
			});
		const moderator = message.author ? user === message.author ? this.client.user : message.author : this.client.user;
		const { modlogs } = await this.client.providers.default.get('modlogs', message.guild.id);
		modlogs.push({
			id: (modlogs.length + 1).toString(),
			timestamp: Date.now(),
			type: message.command.name,
			moderator: moderator.id,
			user: user.id,
			reason
		});
		this.client.providers.default.update('modlogs', message.guild.id, { modlogs });

		const channel = message.guild.channels.get(message.guild.settings.modlogs[message.command.name]);
		if (!channel && message.guild.settings.logging && message.author) {
			return message.send([
				`⚠ It seems that the modlog channel for ${message.command.name}s is not yet set.`,
				'If you want to continue without logging in the future without this warning, you can use `s.conf set logging false`.',
				'This does not mean that I will stop the logs. You can always view them at `s.modlogs`.'
			].join(' '));
		}
		if (!message.guild.settings.logging) return true;
		if (!channel) return true;
		if (!channel.postable) return message.send(`<:redTick:399433440975519754>  ::  It seems that I cannot send messages in ${channel}.`);
		const embed = new MessageEmbed()
			.setColor(configs[message.command.name][0])
			.setTitle(`Case #${modlogs.length}: ${toTitleCase(message.command.name)} ${configs[message.command.name][1]}`)
			.setFooter(`User ID: ${user.id}`)
			.setTimestamp()
			.addField('Moderator', moderator, true)
			.addField(user.bot ? 'Bot' : 'User', user, true);
		if (reason) embed.addField('Reason', reason, true);
		if (duration) embed.addField('Duration', duration === Infinity ? '∞' : Duration.toNow(duration), true);
		if (message.content) {
			embed.addField('Channel', message.channel, true);
			if (message.guild.settings.modlogShowContent) embed.addField('Content', message.content);
		}
		return channel.send(embed);
	}

	async checkAutomodQuota(message, member) {
		if (!member) return null;
		if (!['unban', 'unmute'].includes(message.command.name) && message.author && !message.author.bot) member.addAction(message.command.name);
		if (member.actions.length >= 3) {
			if (message.channel.postable) message.channel.send(`${member.user} made 3 actions within 5 minutes, which is punishable by a ten-minute automated mute.`);
			const duration = await this.client.arguments.get('time').run('10m', '', message);
			this.client.commands.get('mute').run(message, [member, duration, 'Reached automod quota'])
				.then(async () => {
					await member.resetActions();
					this.client.emit('modlogAction', {
						command: this.client.commands.get('mute'),
						channel: message.channel,
						guild: message.guild
					}, member.user, 'Reached automod quota', duration);
				})
				.catch(err => message.send(err));
		}
		return member.actions.length >= 3;
	}

};
