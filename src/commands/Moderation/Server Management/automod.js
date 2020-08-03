const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			runIn: ['text'],
			description: 'Sets the automod settings for the server.',
			extendedHelp: [
				'All filters & modules are disabled by default.',
				'Enable invite filter: `s.automod invite enable`. Same for the swear, spam, and mentionspam filters.',
				'Ignore bots: `s.automod ignorebots enable`',
				'Ignore filters on mods: `s.automod ignoremods enable`',
				'Add words to the swear filter: `s.conf set automod.swearWords <word>`.',
				'Disable filtering words in global filter: `s.conf set automod.globalSwears false`. This is enabled by default.',
				'Disable filtering on certain channels per module: `s.conf set automod.filterIgnore.<module> <channel>`',
				'Change action per module: `s.automod <module> <action>` e.g. `s.automod mentionspam ban`.',
				'Change the duration for mutes and bans: `s.conf set automod.options.<module>.duration <duration>`.',
				'\n`within` means "within x minutes" (except for antiSpam, "within x seconds").',
				'E.g. if `within` is `5` on antiSpam (`limit` set to `3`), it\'d mean "3 messages within 5 seconds". `s.conf set automod.options.antiSpam.within 5`',
				'For quota, it\'d mean "3 offenses within 5 minutes". Please don\'t be confused. 😉'
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
			throw `${this.client.constants.EMOTES.xmark}  ::  \`${possible.name}\` must include: ${modcommands.join(', ')}`;
		});
	}

	async invite(msg, [option]) {
		if (['enable', 'disable'].includes(option)) {
			this.setAutoMod(msg, option, 'antiInvite');
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  The AntiInvite module has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'antiInvite');
			return msg.send(`${this.client.constants.EMOTES.tick}  :: The AntiInvite module now uses the **${option}** action.`);
		}
	}

	async swear(msg, [option]) {
		if (['enable', 'disab;e'].includes(option)) {
			this.setAutoMod(msg, option, 'antiSwear');
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  The AntiSwear module has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'antiSwear');
			return msg.send(`${this.client.constants.EMOTES.tick}  :: The AntiSwear module now uses the **${option}** action.`);
		}
	}

	async spam(msg, [option]) {
		if (['enable', 'disable'].includes(option)) {
			this.setAutoMod(msg, option, 'antiSpam');
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  The AntiSpam module has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'antiSpam');
			return msg.send(`${this.client.constants.EMOTES.tick}  :: The AntiSpam module now uses the **${option}** action.`);
		}
	}

	async mentionspam(msg, [option]) {
		if (['enable', 'disable'].includes(option)) {
			this.setAutoMod(msg, option, 'mentionSpam');
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  The MentionSpam module has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'mentionSpam');
			return msg.send(`${this.client.constants.EMOTES.tick}  :: The MentionSpam module now uses the **${option}** action.`);
		}
	}

	async quota(msg, [option]) {
		if (['enable', 'disable'].includes(option)) {
			this.setAutoMod(msg, option, 'quota');
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  The Action Quota has been ${option}d on ${msg.guild.name}.`);
		} else {
			this.changeAction(msg, option, 'quota');
			return msg.send(`${this.client.constants.EMOTES.tick}  :: The Action Quota module now uses the ${option} action.`);
		}
	}

	async ignorebots(msg, [option]) {
		const _option = this.setAutoMod(msg, option, 'ignoreBots');
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Automod actions will now be ${_option ? 'not ' : ''}applied on bots in ${msg.guild.name}.`);
	}

	async ignoremods(msg, [option]) {
		const _option = this.setAutoMod(msg, option, 'ignoreMods');
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Automod actions will now be ${_option ? 'not ' : ''}applied on moderators in ${msg.guild.name}.`);
	}

	setAutoMod(msg, option, type) {
		const _option = option === 'enable';
		msg.guild.settings.update(`automod.${type}`, _option);
		return _option;
	}

	changeAction(msg, option, type) {
		// eslint-disable-next-line max-len
		if (!['antiInvite', 'antiSwear', 'antiSpam', 'mentionSpam', 'quota'].includes(type)) throw `${this.client.constants.EMOTES.xmark}  ::  The \`${option}\` option is only applicable for automod modules.`;
		msg.guild.settings.update(`automod.options.${type}`, option);
	}

};
