const { Command, RichDisplay, util: { toTitleCase } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			runIn: ['text'],
			aliases: ['modlogs', 'log', 'logs'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gives the modlogs for a certain person or the server, or the details of a specific case number.',
			extendedHelp: [
				'If you want to get the modlogs for the server and not for a user, simple do not provide a user.',
				'If you want to reset the modlogs (not the channels), use the `reset` subcommand.',
				'If you want to get the details of a specific case number, simply run `s.modlog <case number here>`.',
				'To get the modlogs of a certain type, you can use the `--type` flag, e.g. `--type=warn`, `--type=kick`, `ban`, etc.'
			].join('\n'),
			usage: '[reset|showcontent] [CaseNumber:integer|User:user]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(msg, [user]) {
		const { timezone } = msg.author.settings;
		const first5 = [];
		let list = await this.client.providers.default.get('modlogs', msg.guild.id).then(pv => pv.modlogs);

		if (typeof user === 'number') {
			const modlog = await this.client.providers.default.get('modlogs', msg.guild.id).then(ml => ml.modlogs[user - 1]);
			if (!modlog) throw `<:error:508595005481549846>  ::  Whoops! Seems like Case #${user} doesn't exist on this server... yet.`;
			const _user = await this.client.users.fetch(modlog.user).catch(() => null);
			const moderator = await this.client.users.fetch(modlog.moderator).catch(() => null);
			return msg.send({
				embed: new MessageEmbed()
					.setColor('RANDOM')
					.setTitle(`<:blobBan:399433444670701568> Case #${modlog.id} | ${msg.guild.name}`)
					.setDescription([
						`Type: ${toTitleCase(modlog.type)}`,
						`Moderator: ${moderator} (\`${modlog.moderator}\`)`,
						`User: ${_user} (\`${modlog.user}\`)`,
						`Reason: ${modlog.reason || 'Not specified.'}`
					].join('\n'))
					.setTimestamp(new Date(modlog.timestamp))
			});
		}

		if (msg.flags.type && this.client.commands.filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action').keyArray().includes(msg.flags.type)) list = list.filter(ml => ml.type === msg.flags.type); // eslint-disable-line max-len
		if (user) list = list.filter(ml => ml.user === user.id);
		list = list.sort((a, b) => Number(a.id) - Number(b.id));
		if (!list.length) throw `<:blobStop:399433444108533780>  ::  Whoops! It seems that ${user ? user.tag : msg.guild.name} has no record${user ? ' on this server' : ''} yet.`;

		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`<:blobBan:399433444670701568> ${list.length} ${msg.flags.type && this.client.commands.filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action').keyArray().includes(msg.flags.type) ? toTitleCase(msg.flags.type) : 'Modlog'}${list.length === 1 ? '' : 's'} for ${user ? `${user.bot ? 'bot' : 'user'} ${user.tag}` : msg.guild.name}`) // eslint-disable-line max-len
		);

		while (list.length) first5.push(list.splice(0, 5));
		first5.forEach(modlog5 => {
			display.addPage(template => {
				const description = modlog5.map(modlog => {
					const _user = this.client.users.get(modlog.user);
					const moderator = this.client.users.get(modlog.moderator);
					return [
						`__**Case #${modlog.id}**__`,
						`Type: ${toTitleCase(modlog.type)}`,
						`Moderator: ${moderator || 'Could not get user'} (\`${modlog.moderator}\`)`,
						`User: ${_user || 'Could not get user'} (\`${modlog.user}\`)`,
						`Date: ${moment(modlog.timestamp).tz(timezone).format('dddd, LL | LTS z')} (${moment(modlog.timestamp).fromNow()})`,
						`Reason: ${modlog.reason ? escapeMarkdown(modlog.reason) : 'Not specified.'}`
					].join('\n');
				});
				return template.setDescription(description.join('\n\n'));
			});
		});

		return display
			.setFooterPrefix('Page ')
			.run(await msg.channel.send('<a:loading:430269209415516160>  ::  Loading moderation logs...'), { filter: (reaction, author) => author === msg.author });
	}

	async showcontent(msg) {
		const { modlogShowContent } = msg.guild.settings;
		if (modlogShowContent) msg.guild.settings.update('modlogShowContent', false);
		else msg.guild.settings.update('modlogShowContent', true);
		return msg.send(`<:check:508594899117932544>   ::  Content is now ${modlogShowContent ? 'not ' : ''}modlogged.`);
	}

	async reset(msg) {
		let prompt;
		do {
			prompt = await msg.prompt('⚠ Are you sure you want to reset **all** modlogs? Respond with `yes` or `no`.').catch(() => ({ content: 'no' }));
		} while (!['yes', 'no', null].includes(prompt.content));
		if (prompt.content === 'yes') {
			await this.client.providers.default.update('modlogs', msg.guild.id, { modlogs: [] });
			return msg.send(`<:check:508594899117932544>   ::  Successfully reset the modlogs of **${msg.guild.name}**.`);
		} else {
			return msg.send("<:check:508594899117932544>   ::  Alright! You don't want to reset your modlogs.");
		}
	}

};
