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
		if (message.guild.settings.get('automod.quota')) this.checkAutomodQuota(message, await message.guild.members.fetch(user.id).catch(() => null));
		user
			.send(`You have been ${message.command.name}${message.command.name.slice(-3) === 'ban' ? 'n' : ''}${message.command.name.slice(-1) === 'e' ? '' : 'e'}d in **${message.guild}**. ${reason ? `**Reason**: ${reason}` : ''}`) // eslint-disable-line max-len
			.catch(() => {
				if (message.command.name === 'warn' && message.author) message.send(`⚠ I couldn't send messages to **${user.tag}**, so I couldn't warn them; but this will still be logged.`);
			});
		const moderator = message.author ? message.author.equals(user) ? this.client.user : message.author : this.client.user;
		const modlogs = message.guild.modlogs.get('modlogs');
		const channel = message.guild.channels.cache.get(message.guild.settings.get(`modlogs.${message.command.name}`));
		if (!channel && message.guild.settings.get('logging') && message.author) {
			return message.send([
				`⚠ It seems that the modlog channel for ${message.command.name}s is not yet set.`,
				`If you want to continue without logging in the future without this warning, you can use \`${message.guild.settings.get('prefix')}conf set logging false\`.`,
				`This does not mean that I will stop the logs. You can always view them at \`${message.guild.settings.get('prefix')}modlogs\`.`
			].join(' '));
		}

		let logMessage = { id: null };
		if (message.guild.settings.get('logging') && channel) {
			if (!channel.postable) return message.send(`<:error:508595005481549846>  ::  It seems that I cannot send messages in ${channel}.`);
			const embed = new MessageEmbed()
				.setColor(configs[message.command.name][0])
				.setTitle(`Case #${modlogs.length + 1}: ${toTitleCase(message.command.name)} ${configs[message.command.name][1]}`)
				.setFooter(`User ID: ${user.id}`)
				.setTimestamp()
				.addField('Moderator', moderator, true)
				.addField(user.bot ? 'Bot' : 'User', user, true);
			if (reason) embed.addField('Reason', reason, true);
			if (duration) embed.addField('Duration', duration === Infinity ? '∞' : Duration.toNow(duration), true);
			if (message.content) {
				embed.addField('Channel', message.channel, true);
				if (message.guild.settings.get('modlogShowContent')) embed.addField('Content', message.content > 900 ? `${message.content.substring(0, 900)}...` : message.content);
			}
			logMessage = await channel.send(embed);
		}

		modlogs.push({
			id: (modlogs.length + 1).toString(),
			message: logMessage.id,
			moderator: moderator.id,
			reason,
			timestamp: Date.now(),
			type: message.command.name,
			user: user.id
		});
		return message.guild.modlogs.update('modlogs', modlogs);
	}

	async checkAutomodQuota(message, member) {
		if (!member) return null;
		if (!['unban', 'unmute'].includes(message.command.name) && message.author && !message.author.bot) member.addAction(message.command.name);

		const { limit, duration, action, within } = await message.guild.settings.get('automod.options.quota');
		if (member.actions.length >= limit) {
			if (message.channel.postable) message.channel.send(`${member.user} made ${limit} actions within ${within} minutes, which is punishable by a ${duration}-minute automated ${action}.`);
			await member.resetActions();

			const actionDuration = duration ? await this.client.arguments.get('time').run(`${duration}m`, '', message) : null;
			switch (action) {
				case 'warn': return this.client.emit('modlogAction', {
					command: this.client.commands.get('warn'),
					channel: message.channel,
					guild: message.guild,
					content: message.content
				}, member.user, 'Reached automod quota', null);
				case 'kick': return this.client.commands.get('kick').run(message, [member.user, ['Reached automod quota']]).catch(err => message.send(err));
				case 'mute': return this.client.commands.get('mute').run(message, [member, actionDuration, 'Reached automod quota'], true).catch(err => message.send(err));
				case 'ban': return this.client.commands.get('ban').run(message, [member.user, null, actionDuration, ['Reached automod quota']], true).catch(err => message.send(err));
				case 'softban': return this.client.commands.get('softban').run(message, [member.user, null, ['Reached automod quota']]).catch(err => message.send(err));
			}
		}
		return member.actions.length >= limit;
	}

};
