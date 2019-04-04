const { Command, util: { isFunction, toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands', 'cmds'],
			guarded: true,
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Sends the command list to our DMs. Make sure I can send you one!',
			extendedHelp: [
				'If you want to get more information about a command, use `s.help <command>`.',
				'If you want to get the commands for a specific category, use `s.help <category>`.',
				'If you want to get the commands for a specific subcategory under a category, use `s.help <category>, <subcategory>`.'
			].join('\n'),
			usage: '[Command:command|Category:string] [Subcategory:string]',
			usageDelim: ', '
		});
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

		const method = this.client.user.bot ? 'author' : 'channel';
		const help = await this.buildHelp(msg, [category ? toTitleCase(category) : undefined, subcategory ? toTitleCase(subcategory) : undefined]);
		const categories = Object.keys(help);
		const helpMessage = [];
		for (let cat = 0; cat < categories.length; cat++) {
			helpMessage.push(`**↞――――― __${categories[cat]} Commands__ ―――――↠**\n`);
			const subCategories = Object.keys(help[categories[cat]]);
			for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`⇋ **[ ${subCategories[subCat]} ]** ⇋\n`, `${help[categories[cat]][subCategories[subCat]].join('\n')}\n`, '\u200b'); // eslint-disable-line max-len
			if (cat === categories.length - 1) {
				helpMessage.push([
					this.client.application.botPublic ? [
						`\nWant to add ${this.client.user.username} to your own server or to a server you manage? If you have **Manage Server** permissions, you can add this bot by using the link:`,
						`<http://bit.ly/${this.client.user.username.split(' ').join('-')}>`,
						'\nNeed help or has ideas for the bot? Just want somewhere to hang out? Be with us here:',
						`**${this.client.guilds.get('502895390807293963').name}** (<https://discord.gg/KDWGvV8>)`,
						`\nUse the command \`${this.client.options.prefix}bug\` to report a bug and \`${this.client.options.prefix}suggest\` if you have suggestions.`,
						'\n__**DONATION PERKS**__',
						'$3 ⇒ Enable the history and playlist features.',
						'$5 ⇒ Removal of 5-hour limit for each track in music. ($3 perk is included)',
						'$8 ⇒ Make bot not leave within 30 seconds when no one is connected to voice channel. ($3 and $5 perks are included)',
						'$10 ⇒ Autoplay songs (add related videos when queue is empty). Only applicable for YouTube videos.',
						'*Please pay at <https://paypal.me/Dwigoric>. We use **US dollars (USD)**.*',
						`*AFTER donating, contact ${this.client.application.owner.tag} or go to my support server to avail of these perks.*`
					].join('\n') : '',
					`\nBot developed by **${this.client.application.owner.tag}**, from 🇵🇭 with ❤`,
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
			if (!this.client.commands.map(cmd => cmd.category).includes(category)) throw `<:error:508595005481549846>  ::  **${category}** is not a valid category!`;
			cmds = this.client.commands.filter(cmd => cmd.category === category);
		}
		if (subcategory) {
			if (!this.client.commands.map(cmd => cmd.subCategory).includes(subcategory)) throw `<:error:508595005481549846>  ::  **${subcategory}** is not a valid subcategory!`;
			cmds = this.client.commands.filter(cmd => cmd.category === category && cmd.subCategory === subcategory);
		}

		await Promise.all(cmds.map(async command => {
			if (!await msg.hasAtLeastPermissionLevel(9) && command.category === 'Admin' && ['General', 'Bot Owner'].includes(command.subCategory)) return null;
			const cat = category || command.category;
			const subCat = subcategory || command.subCategory;
			if (!help.hasOwnProperty(cat)) help[cat] = {};
			if (!help[cat].hasOwnProperty(subCat)) help[cat][subCat] = [];
			const description = typeof command.description === 'function' ? command.description(msg.language) : command.description;
			return help[cat][subCat].push(`\`${this.client.options.prefix}${command.name.padEnd(longest)}\` ⇒ ${description}`);
		}));

		if (!Object.keys(help).length) throw `<:error:508595005481549846>  ::  It would seem that **${subcategory}** is not under **${category}**.`;
		return help;
	}

};
