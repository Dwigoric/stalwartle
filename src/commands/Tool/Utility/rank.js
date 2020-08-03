const { Command, RichDisplay, util: { regExpEsc, chunk } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['MANAGE_ROLES'],
			description: 'Gives/takes a self-assignable role (selfrole).',
			extendedHelp: 'You can setup selfroles via `s.conf set selfroles`',
			usage: '[list] (SelfAssignableRole:string)',
			subcommands: true
		});
		this.createCustomResolver('string', (arg, possible, message, [action]) => {
			if (action === 'list') return undefined;
			if (!action && !arg) throw message.language.get('COMMANDMESSAGE_MISSING_REQUIRED', possible.name);
			return this.client.arguments.get('string').run(arg, possible, message);
		});
	}

	async run(msg, [sar]) {
		const selfroles = msg.guild.settings.get('selfroles');
		if (!selfroles.length) throw `${this.client.constants.EMOTES.xmark}  ::  Selfrole is not yet implemented in this server.`;
		const role = selfroles.map(_sar => msg.guild.roles.cache.get(_sar)).find(rl => new RegExp(regExpEsc(sar), 'i').test(rl.name));
		if (!role) throw `${this.client.constants.EMOTES.xmark}  ::  Invalid selfrole. Check all available selfroles in this server by using \`${msg.guild.settings.get('prefix')}rank list\`.`;
		if (role.position > msg.guild.me.roles.highest.position) throw `${this.client.constants.EMOTES.xmark}  ::  **${escapeMarkdown(role.name)}**'s position is higher than me.`;
		if (msg.member.roles.cache.has(role.id)) {
			await msg.member.roles.remove(role, `[Selfrole Remove] Selfrole feature of ${this.client.user.username}`);
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  **${escapeMarkdown(role.name)}** has been taken from **${escapeMarkdown(msg.member.displayName)}** via selfrole.`);
		} else {
			await msg.member.roles.add(role, `[Selfrole Add] Selfrole feature of ${this.client.user.username}`);
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  **${escapeMarkdown(msg.member.displayName)}** has been given **${escapeMarkdown(role.name)}** via selfrole.`);
		}
	}

	async list(msg) {
		if (!msg.channel.permissionsFor(this.client.user).has(['EMBED_LINKS', 'MANAGE_MESSAGES'])) throw `${this.client.constants.EMOTES.xmark}  ::  I need to be able to **Embed Links** and **Manage Messages** (permissions).`; // eslint-disable-line max-len
		const selfroles = msg.guild.settings.get('selfroles');
		if (!selfroles.length) throw `${this.client.constants.EMOTES.xmark}  ::  Selfrole is not yet implemented in this server.`;
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading the selfrole list`);
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`Selfroles for ${msg.guild.name}`, msg.guild.iconURL())
			.setTitle('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.setTimestamp());

		chunk(selfroles, 10).forEach((selfroleList, tenPower) => display.addPage(template => template.setDescription(selfroleList.map((selfrole, onePower) => {
			const currentPos = (tenPower * 10) + (onePower + 1);
			return `\`${currentPos}\`. ${msg.guild.roles.cache.get(selfrole).name}`;
		}).join('\n'))));

		return display
			.setFooterPrefix('Page ')
			.setFooterSuffix(` [${selfroles.length} Selfrole${selfroles.length === 1 ? '' : 's'}]`)
			.run(message, { filter: (reaction, author) => author === msg.author });
	}

};
