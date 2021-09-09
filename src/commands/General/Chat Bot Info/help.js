const { Command, RichDisplay, util: { isFunction, toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');

const time = 1000 * 60 * 3;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands', 'cmds'],
			description: 'Sends the command list to our DMs. Make sure I can send you one!',
			extendedHelp: [
				'If you want to get more information about a command, use `s.help <command>`.',
				'If you want to get the commands for a specific category, use `s.help <category>`.',
				'If you want to get the commands for a specific subcategory under a category, use `s.help <category>, <subcategory>`.'
			].join('\n'),
			guarded: true,
			requiredPermissions: ['EMBED_LINKS'],
			usage: '[Command:command|Category:string] [Subcategory:string]',
			usageDelim: ', '
		});

		// Cache the handlers
		this.handlers = new Map();
	}

	async run(msg, [category, subcategory]) {
		if (category instanceof Command) {
			return msg.send({
				embed: new MessageEmbed()
					.setTitle(`The \`${this.client.options.prefix}${category.name}\` command`)
					.setDescription(isFunction(category.description) ? category.description(msg.language) : category.description)
					.addField('Usage', `\`${this.client.options.prefix}${category.usage}\``)
					.addField('Additional Information', isFunction(category.extendedHelp) ? category.extendedHelp(msg.language) : category.extendedHelp)
					.addField('Usage Legend', '`<required> [optional] (semirequired)` // `Name:type`')
					.setFooter(`Classification: ${category.category} → ${category.subCategory}`)
			});
		}

		if (!('all' in msg.flagArgs) && msg.guild && msg.channel.permissionsFor(this.client.user).has(['MANAGE_MESSAGES', 'ADD_REACTIONS', 'EMBED_LINKS'])) {
			// Finish the previous handler
			const previousHandler = this.handlers.get(msg.author.id);
			if (previousHandler) previousHandler.stop();

			const handler = await (await this.buildDisplay(msg, [category, subcategory])).run(await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading commands...`), {
				filter: (reaction, user) => user.id === msg.author.id,
				time
			});
			handler.on('end', () => this.handlers.delete(msg.author.id));
			this.handlers.set(msg.author.id, handler);
			return handler;
		}

		return this.originalHelp(msg, [category, subcategory]);
	}

	async originalHelp(msg, [category, subcategory]) {
		await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading commands...`);
		const method = this.client.user.bot ? 'author' : 'channel';
		const help = await this.buildHelp(msg, [category ? toTitleCase(category) : undefined, subcategory ? toTitleCase(subcategory) : undefined]);
		const categories = Object.keys(help);
		const helpMessage = [];
		for (let cat = 0; cat < categories.length; cat++) {
			helpMessage.push(`**↞――――― __${categories[cat]} Commands__ ―――――↠**\n`);
			const subCategories = Object.keys(help[categories[cat]]);
			if (msg.flagArgs.all || subcategory || category) for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`⇋ **[ ${subCategories[subCat]} ]** ⇋\n`, `${help[categories[cat]][subCategories[subCat]].join('\n')}\n`, '\u200b'); // eslint-disable-line max-len
			else for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`⇒ ${subCategories[subCat]}`, '\u200b');
			if (cat === categories.length - 1) {
				if (!msg.flagArgs.all) {
					helpMessage.push(
						`\n**${'\\*'.repeat(75)}**`,
						'***Say `s.help <category>` (e.g. `s.help Music`) to get the commands for that category.***',
						'***Say `s.help <category>, <subcategory>` (e.g. `s.help Music, Control`) to get the commands of a specific subcategory.***',
						`**${'\\*'.repeat(75)}**`,
						'\u200b'
					);
				}
				helpMessage.push([
					this.client.application.botPublic ? [
						`\nWant to add ${this.client.user.username} to your own server or to a server you manage? If you have **Manage Server** permissions, you can add this bot by using the link:`,
						`<https://bit.ly/${this.client.user.username.split(' ').join('-')}>`,
						'\nNeed help or has ideas for the bot? Just want somewhere to hang out? Be with us here:',
						`**${this.client.guilds.cache.get('502895390807293963').name}** ⇒ https://discord.gg/KDWGvV8`,
						`\nUse the command \`${this.client.options.prefix}bug\` to report a bug and \`${this.client.options.prefix}suggest\` if you have suggestions.`,
						'\n__**DONATION PERKS**__',
						'$3 ⇒ Enable the history and playlist features.',
						'$5 ⇒ Removal of 5-hour limit for each track in music. ($3 perk is included)',
						'$8 ⇒ Autoplay songs (add related videos when queue is empty). Only applicable for YouTube videos. ($3 and $5 perks are included)',
						'$10 ⇒ Make bot not leave within 30 seconds when no one is connected to voice channel; unless the bot is rebooted. ($3, $5, and $8 perks are included)',
						'**Fiat Channels**',
						'PayPal: <https://www.paypal.com/donate?hosted_button_id=EPD2AY6LRNDGS>',
						'Ko-fi: <https://ko-fi.com/dwigoric>',
						'Patreon: <https://patreon.com/Dwigoric>.',
						'**Cryptocurrency Channel**: <https://nowpayments.io/donation/stalwartle>',
						`*AFTER donating, contact ${(await this.client.users.fetch(this.client.options.ownerID)).tag} or go to my support server to avail of these perks.*`
					].join('\n') : '',
					`\nBot developed by **${this.client.application.owner}**, from 🇵🇭 with ❤`,
					`💡 **ProTip #1**: By mentioning "${this.client.user}", I will give the server's current prefix.`,
					'💡 **ProTip #2**: Prefixes are **case-insensitive**, and **unprefixed commands** are supported **in DMs**.',
					"💡 **ProTip #3**: By using `s.help (command)`, you can get the command's additional information!",
					'💡 **ProTip #4**: Getting tired of retyping the commands because you made a typo? Worry not! Just edit your message and the bot will edit the response accordingly!',
					'💡 **ProTip #5**: You do not want to use some commands in your server? Just use `s.conf set disabledCommands <command>`!',
					'💡 **ProTip #6**: Having fun with the `s.conf` command? To access folders in e.g. `show` subcommand, use `s.conf show <folder>`. To access items inside the folder, use `s.conf show <folder>.<item>`.' // eslint-disable-line max-len
				].join('\n'));
			}
		}

		return msg[method].send(helpMessage, { split: { char: '\u200b' } })
			.then(() => { if (msg.channel.type !== 'dm' && this.client.user.bot) msg.send(msg.language.get('COMMAND_HELP_DM')); })
			.catch(() => { if (msg.channel.type !== 'dm' && this.client.user.bot) msg.send(msg.language.get('COMMAND_HELP_NODM')); });
	}

	async buildHelp(msg, [category, subcategory]) {
		const help = {};

		const commandNames = [...this.client.commands.keys()];
		const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

		let cmds;
		if (!category && !subcategory) cmds = this.client.commands;
		if (category) {
			if (!this.client.commands.map(cmd => cmd.category).includes(category)) throw `${this.client.constants.EMOTES.xmark}  ::  **${category}** is not a valid category!`;
			cmds = this.client.commands.filter(cmd => cmd.category === category);
		}
		if (subcategory) {
			if (!this.client.commands.map(cmd => cmd.subCategory).includes(subcategory)) throw `${this.client.constants.EMOTES.xmark}  ::  **${subcategory}** is not a valid subcategory!`;
			cmds = this.client.commands.filter(cmd => cmd.category === category && cmd.subCategory === subcategory);
		}

		await Promise.all(cmds.map(async command => {
			if (!await msg.hasAtLeastPermissionLevel(9) && command.category === 'Admin' && ['General', 'Bot Owner'].includes(command.subCategory)) return null;
			const cat = category || command.category;
			const subCat = subcategory || command.subCategory;
			if (!Object.prototype.hasOwnProperty.call(help, cat)) help[cat] = {};
			if (!Object.prototype.hasOwnProperty.call(help[cat], subCat)) help[cat][subCat] = [];
			const description = typeof command.description === 'function' ? command.description(msg.language) : command.description;
			return help[cat][subCat].push(`\`${this.client.options.prefix}${command.name.padEnd(longest)}\` ⇒ ${description}`);
		}));

		if (!Object.keys(help).length) throw `${this.client.constants.EMOTES.xmark}  ::  It would seem that **${subcategory}** is not under **${category}**.`;
		return help;
	}

	async buildDisplay(message, [maincategory, subcategory]) {
		const commands = await this._fetchCommands(message, [maincategory ? toTitleCase(maincategory) : undefined, subcategory ? toTitleCase(subcategory) : undefined]);
		const prefix = message.guildSettings.get('prefix');
		const display = new RichDisplay();
		const color = message.member.displayColor;
		for (const [category, list] of commands) {
			display
				.addPage(new MessageEmbed()
					.setTitle(`${category} Commands`)
					.setColor(color)
					.setDescription(list.map(this.formatCommand.bind(this, message, prefix, true)).join('\n')))
				.setFooterSuffix(' | To know more about Donation Perks and ProTips from our developers, say `help` in DMs with Stalwartle!');
		}

		return display;
	}

	formatCommand(message, prefix, richDisplay, command) {
		const description = isFunction(command.description) ? command.description(message.language) : command.description;
		return richDisplay ? `• \`${prefix}${command.name}\` → ${description}` : `• **${prefix}${command.name}** → ${description}`;
	}

	async _fetchCommands(message, [maincategory, subcategory]) {
		const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
		const commands = new Map();

		let cmds;
		if (!maincategory && !subcategory) cmds = this.client.commands;
		if (maincategory) {
			if (!this.client.commands.map(cmd => cmd.category).includes(maincategory)) throw `${this.client.constants.EMOTES.xmark}  ::  **${maincategory}** is not a valid category!`;
			cmds = this.client.commands.filter(cmd => cmd.category === maincategory);
		}
		if (subcategory) {
			if (!this.client.commands.map(cmd => cmd.subCategory).includes(subcategory)) throw `${this.client.constants.EMOTES.xmark}  ::  **${subcategory}** is not a valid subcategory!`;
			cmds = this.client.commands.filter(cmd => cmd.category === maincategory && cmd.subCategory === subcategory);
		}

		await Promise.all(cmds.map(command => run(command, true)
			.then(async () => {
				if (!await message.hasAtLeastPermissionLevel(9) && command.category === 'Admin' && ['General', 'Bot Owner'].includes(command.subCategory)) return null;
				const category = commands.get(`${command.category} - ${command.subCategory}`);
				if (category) return category.push(command);
				else return commands.set(`${command.category} - ${command.subCategory}`, [command]);
			}).catch(() => {
				// noop
			})
		));

		return commands;
	}

};
