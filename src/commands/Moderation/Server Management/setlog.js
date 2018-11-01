const { Command, util: { toTitleCase } } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['setlogs'],
			permissionLevel: 7,
			runIn: ['text'],
			description: 'Configures the modlog channel in the server.',
			extendedHelp: [
				'If you want to configure the modlog for all moderation actions, do not use any subcommand.',
				'If you want to reset the modlog channels, use the `reset` subcommand.',
				'If you want to reset the modlog channel for a specific moderation action, use `s.setlog <moderation action> reset`',
				'If you want to list the modlog channels each moderation action is assigned to, use the `list` subcommand.'
			].join('\n'),
			usage: '[list|kick|ban|softban|unban|mute|unmute|reset] (reset|Modlog:channel)',
			usageDelim: ' ',
			subcommands: true
		});

		this.createCustomResolver('channel', async (arg, possible, msg, [action]) => {
			if (['list', 'reset'].includes(action)) return undefined;
			if (arg) {
				const modlog = await this.client.arguments.get('channel').run(arg, possible, msg);
				if (!modlog.postable) throw `<:redTick:399433440975519754>  ::  It seems that I cannot send messages in ${modlog}.`;
				return modlog;
			} else { throw '<:redTick:399433440975519754>  ::  Please provide the modlog channel.'; }
		});
	}

	async list(msg) {
		const { modlogs } = msg.guild.settings;
		const { channels } = msg.guild;
		return msg.send(this.client.commands
			.filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action')
			.map(action => `${toTitleCase(action.name)}s: ${modlogs[action.name] ? channels.get(modlogs[action.name]) : 'Not yet set.'}`)
			.join('\n'));
	}

	async run(msg, [modlog]) {
		this.client.commands.filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cd => cd.name).forEach(action => msg.guild.settings.update(`modlogs.${action}`, modlog.id));
		return msg.send(`<:greenTick:399433439280889858>  ::  Successfully updated the modlog channel for all moderation actions to ${modlog}.`);
	}

	async reset(msg) {
		this.client.commands.filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cd => cd.name).forEach(action => msg.guild.settings.reset(`modlogs.${action}`));
		return msg.send('<:greenTick:399433439280889858>  ::  Successfully reset the modlog channel for all moderation actions.');
	}

	async kick(msg, [modlog]) {
		return await this.indivSet(msg, modlog, 'kick');
	}

	async ban(msg, [modlog]) {
		return await this.indivSet(msg, modlog, 'ban');
	}

	async softban(msg, [modlog]) {
		return await this.indivSet(msg, modlog, 'softban');
	}

	async unban(msg, [modlog]) {
		return await this.indivSet(msg, modlog, 'unban');
	}

	async mute(msg, [modlog]) {
		return await this.indivSet(msg, modlog, 'mute');
	}

	async unmute(msg, [modlog]) {
		return await this.indivSet(msg, modlog, 'unmute');
	}

	async indivSet(msg, modlog, action) {
		if (modlog === 'reset') msg.guild.settings.reset(`modlogs.${action}`);
		else msg.guild.settings.update(`modlogs.${action}`, modlog.id, msg.guild);
		return msg.send(`<:greenTick:399433439280889858>  ::  Successfully updated the modlog channel for member ${action}s to ${modlog}.`);
	}

};
