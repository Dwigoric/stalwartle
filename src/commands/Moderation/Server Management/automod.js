const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			runIn: ['text'],
			description: 'Sets the automod settings for the server.',
			extendedHelp: [
				'All filters are disabled by default. If you want to enable the invite filter, use `s.automod invite enable`. Same for the swear, spam, and mentionspam filters.',
				'To ignore bots, use `s.automod ignorebots enable`. This is disabled by default.',
				'You can also ignore filters on mods. Juse use `s.automod ignoremods enable`. This is disabled by default.',
				'\nTo add words to the swear filter, use `s.conf set automod.swearWords <word>`.',
				'To disable filtering the words in the global filter, use `s.conf set automod.globalSwears false`. This is enabled by default.',
				'\nYou can disable filtering on certain channels per module. Just use `s.conf set automod.filterIgnore.<module> <channel>`',
				'\nTo change the action for an automod module, just use `s.automod <module> <action>` e.g. `s.automod mentionspam ban`.',
				'To change the duration for mutes and bans, just use `s.conf set automod.options.<module>.duration <duration>`.',
				'`within` in the server settings means "within x minutes" (except for antiSpam, where it means "within x seconds").',
				'For example, if you set `5` for `within` on antiSpam (with `limit` set to `3`), it would mean "3 messages within 5 seconds". Just do `s.conf set automod.options.antiSpam.within 5`',
				'However, for quota, it would mean "3 offenses within 5 minutes". Please do not be confused. 😉'
			].join('\n'),
			usage: '<invite|swear|spam|mentionspam|quota|ignorebots|ignoremods> (enable|disable|actionType:string)',
			usageDelim: ' ',
			subcommands: true
		});

		this.createCustomResolver('string', (arg, possible, message) => {
			if (!arg) throw message.language.get('COMMANDMESSAGE_MISSING_REQUIRED', possible.name);
			if (['enable', 'disable'].includes(arg)) return arg;
			const modcommands = this.client.commands.filter(cmd => !['unban', 'unmute'].includes(cmd.name) && cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cd => cd.name);
			if (modcommands.includes(arg)) return arg;
			throw `<:error:508595005481549846>  ::  \`${possible.name}\` must include: ${modcommands.join(', ')}`;
		});
	}

	async invite(msg, [option]) {
		if (['enable', 'disable'].includes(option)) {
			this.setAutoMod(msg, option, 'antiInvite');
			return msg.send(`<:check:508594899117932544>  ::  The AntiInvite module has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'antiInvite');
			return msg.send(`<:check:508594899117932544>  :: The AntiInvite module now uses the **${option}** action.`);
		}
	}

	async swear(msg, [option]) {
		if (['enable', 'disab;e'].includes(option)) {
			this.setAutoMod(msg, option, 'antiSwear');
			return msg.send(`<:check:508594899117932544>  ::  The AntiSwear module has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'antiSwear');
			return msg.send(`<:check:508594899117932544>  :: The AntiSwear module now uses the **${option}** action.`);
		}
	}

	async spam(msg, [option]) {
		if (['enable', 'disable'].includes(option)) {
			this.setAutoMod(msg, option, 'antiSpam');
			return msg.send(`<:check:508594899117932544>  ::  The AntiSpam module has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'antiSpam');
			return msg.send(`<:check:508594899117932544>  :: The AntiSpam module now uses the **${option}** action.`);
		}
	}

	async mentionspam(msg, [option]) {
		if (['enable', 'disable'].includes(option)) {
			this.setAutoMod(msg, option, 'mentionSpam');
			return msg.send(`<:check:508594899117932544>  ::  The MentionSpam module has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'mentionSpam');
			return msg.send(`<:check:508594899117932544>  :: The MentionSpam module now uses the **${option}** action.`);
		}
	}

	async quota(msg, [option]) {
		if (['enable', 'disable'].includes(option)) {
			this.setAutoMod(msg, option, 'quota');
			return msg.send(`<:check:508594899117932544>  ::  The Action Quota has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'quota');
			return msg.send(`<:check:508594899117932544>  :: The Action Quota module now uses the ${option} action.`);
		}
	}

	async ignorebots(msg, [option]) {
		const _option = this.setAutoMod(msg, option, 'ignoreBots');
		return msg.send(`<:check:508594899117932544>  ::  Automod actions will now be ${_option ? 'not ' : ''}applied on bots in ${msg.guild.name}.`);
	}

	async ignoremods(msg, [option]) {
		const _option = this.setAutoMod(msg, option, 'ignoreMods');
		return msg.send(`<:check:508594899117932544>  ::  Automod actions will now be ${_option ? 'not ' : ''}applied on moderators in ${msg.guild.name}.`);
	}

	setAutoMod(msg, option, type) {
		const _option = option === 'enable';
		msg.guild.settings.update(`automod.${type}`, _option);
		return _option;
	}

	changeAction(msg, option, type) {
		if (!['antiInvite', 'antiSwear', 'antiSpam', 'mentionSpam', 'quota'].includes(type)) throw `<:error:508595005481549846>  ::  The \`${option}\` option is only applicable for automod modules.`;
		msg.guild.settings.update(`automod.options.${type}`, option);
	}

};
