const { Finalizer, Duration } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Finalizer {

	/* eslint "complexity": ["warn", 25] */
	async run(msg, response) {
		if (!this.client.commands.filter(cd => cd.category === 'Moderation' && cd.subCategory === 'Action').map(cmd => cmd.name).includes(msg.command.name)) return null;
		const member = await msg.guild.members.fetch(response[0].id);
		if (!['unban', 'unmute'].includes(msg.command.name) && !msg.author.bot) member.addAction(msg.command.name);
		if (member.actions.length >= 3) {
			if (msg.channel.postable) msg.channel.send(`${msg.author} made 3 actions within 5 minutes, which is punishable by a ten-minute automated mute.`);
			const duration = await this.client.arguments.get('time').run('10m', '', msg);
			this.client.commands.get('mute').run(msg, [member, duration, 'Reached automod quota'])
				.then(() => {
					member.resetActions();
					this.run({
						command: this.client.commands.get('mute'),
						channel: msg.channel,
						guild: msg.guild
					}, [msg.author, 'Reached automod quota', duration]);
				})
				.catch(err => msg.send(err));
		}
		response[0]
			.send(`You have been ${msg.command.name}${msg.command.name.slice(-3) === 'ban' ? 'n' : ''}${msg.command.name.slice(-1) === 'e' ? '' : 'e'}d in **${msg.guild}**. ${response[1] ? `**Reason**: ${response[1]}` : ''}`) // eslint-disable-line max-len
			.catch(() => {
				if (msg.command.name === 'warn' && msg.author) msg.send(`⚠ I couldn't send messages to **${response[0].tag}**, so I couldn't warn them; but this will still be logged.`);
			});
		const configs = {
			kick: ['#FBA200', '👢'],
			ban: ['#800000', '<:blobBan:399433444670701568>'],
			softban: ['#3498DB', '❌💬'],
			unban: ['#B5CD3B', '<:blobok:398843279665528843>'],
			mute: ['#FFD700', '<:blobstop:446987757651361813>'],
			unmute: ['#24E4D0', '<:blobgo:398843278243528707>'],
			warn: ['#B2884D', '<:blobthinkstare:398843280135028738>']
		};
		const moderator = msg.author ? response[0] === msg.author ? this.client.user : msg.author : this.client.user;
		const { modlogs } = await this.client.providers.default.get('modlogs', msg.guild.id);
		modlogs.push({
			id: (modlogs.length + 1).toString(),
			timestamp: Date.now(),
			type: msg.command.name,
			moderator: moderator.id,
			user: response[0].id,
			reason: response[1]
		});
		this.client.providers.default.update('modlogs', msg.guild.id, { modlogs });
		const channel = msg.guild.channels.get(msg.guild.settings.modlogs[msg.command.name]);
		if (!channel && msg.guild.settings.logging && msg.author) {
			return msg.send([
				`⚠ It seems that the modlog channel for ${msg.command.name}s is not yet set.`,
				'If you want to continue without logging in the future without this warning, you can use `s.conf set logging false`.',
				'This does not mean that I will stop the logs. You can always view them at `s.modlogs`.'
			].join(' '));
		}
		if (!msg.guild.settings.logging) return true;
		if (!channel) return true;
		if (!channel.postable) return msg.send(`<:redTick:399433440975519754>  ::  It seems that I cannot send messages in ${channel}.`);
		const embed = new MessageEmbed()
			.setColor(configs[msg.command.name][0])
			.setTitle(`Case #${modlogs.length}: ${msg.command.name.toTitleCase()} ${configs[msg.command.name][1]}`)
			.setFooter(`User ID: ${response[0].id}`)
			.setTimestamp()
			.addField('Moderator', moderator, true)
			.addField(response[0].bot ? 'Bot' : 'User', response[0], true);
		if (response[1]) embed.addField('Reason', response[1], true);
		if (response[2]) embed.addField('Duration', response[2] === Infinity ? '∞' : Duration.toNow(response[2]), true);
		if (response[3]) {
			embed.addField('Channel', msg.channel, true);
			if (msg.guild.settings.modlogShowContent) embed.addField('Content', response[3]);
		}
		return channel.send(embed);
	}

	async init() {
		const defProvider = this.client.providers.default;
		if (!await defProvider.hasTable('modlogs')) defProvider.createTable('modlogs');
	}

};
