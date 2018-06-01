const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			runIn: ['text'],
			description: 'Sets the automod settings for the server.',
			extendedHelp: [
				'All filters are disabled by default. If you want to enable the invite filter, use `s.automod invite enable`. Same for the swear filter.',
				'To ignore bots, use `s.automod ignorebots enable`. This is disabled by default.',
				'You can also ignore filters on mods. Juse use `s.automod ignoremods enable`. This is disabled by default.',
				'\nTo add words to the swear filter, use `s.conf set automod.swearWords <word>`.',
				'To disable filtering the words in the global filter, use `s.conf set automod.globalSwears false`. This is enabled by default.',
				'\nYou can disable filtering on certain channels. Just use `s.conf set automod.filterIgnore <channel>`'
			].join('\n'),
			usage: '<invite|swear|spam|mentionspam|ignorebots|ignoremods> <enable|disable>',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async invite(msg, [option]) {
		await this.setAutoMod(msg, option, 'antiInvite');
		return msg.send(`<:greenTick:399433439280889858>  ::  The AntiInvite module has been ${option}d on ${msg.guild.name}.`);
	}

	async swear(msg, [option]) {
		await this.setAutoMod(msg, option, 'antiSwear');
		return msg.send(`<:greenTick:399433439280889858>  ::  The AntiSwear module has been ${option}d on ${msg.guild.name}.`);
	}

	async spam(msg, [option]) {
		await this.setAutoMod(msg, option, 'antiSpam');
		return msg.send(`<:greenTick:399433439280889858>  ::  The AntiSpam module has been ${option}d on ${msg.guild.name}.`);
	}

	async mentionspam(msg, [option]) {
		await this.setAutoMod(msg, option, 'mentionSpam');
		return msg.send(`<:greenTick:399433439280889858>  ::  The MentionSpam module has been ${option}d on ${msg.guild.name}.`);
	}

	async ignorebots(msg, [option]) {
		const _option = await this.setAutoMod(msg, option, 'ignoreBots');
		return msg.send(`<:greenTick:399433439280889858>  ::  Automod actions will now be ${_option ? 'not ' : ''}applied on bots in ${msg.guild.name}.`);
	}

	async ignoremods(msg, [option]) {
		const _option = await this.setAutoMod(msg, option, 'ignoreMods');
		return msg.send(`<:greenTick:399433439280889858>  ::  Automod actions will now be ${_option ? 'not ' : ''}applied on moderators in ${msg.guild.name}.`);
	}

	async setAutoMod(msg, option, type) {
		let _option;
		if (option === 'enable') _option = true;
		else _option = false;
		msg.guild.configs.update(`automod.${type}`, _option);
		return _option;
	}

	async init() {
		const guildSchema = this.client.gateways.guilds.schema;
		if (!guildSchema.automod) await guildSchema.add('automod', { type: 'Folder' });
		if (!guildSchema.automod.ignoreBots) await guildSchema.automod.add('ignoreBots', { type: 'boolean', default: false, configurable: true });
		if (!guildSchema.automod.ignoreMods) await guildSchema.automod.add('ignoreMods', { type: 'boolean', default: false, configurable: true });
		if (!guildSchema.automod.filterIgnore) await guildSchema.automod.add('filterIgnore', { type: 'channel', array: true, default: [], configurable: true });
	}

};
