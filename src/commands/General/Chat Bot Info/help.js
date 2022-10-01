const { LazyPaginatedMessage } = require('@sapphire/discord.js-utilities');
const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { toTitleCase } = require('@sapphire/utilities');
const { MessageEmbed, Util: { splitMessage } } = require('discord.js');

function formatCommand(prefix, richDisplay, command) {
    const { description } = command;
    return richDisplay ? `• \`${prefix}${command.name}\` → ${description}` : `• **${prefix}${command.name}** → ${description}`;
}

function getUsage(command) {
    const names = [command.name].concat(command.aliases);
    return `${names.length === 1 ? names.join('') : `《${names.join('|')}》`}${command.usage ? ` ${command.usage}` : ''}`;
}

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['commands', 'cmds'],
            description: 'Sends the command list to our DMs. Make sure I can send you one!',
            detailedDescription: [
                'If you want to get more information about a command, use `s.help <command>`.',
                'If you want to get the commands for a specific category, use `s.help <category>`.',
                'If you want to get the commands for a specific subcategory under a category, use `s.help <category> <subcategory>`.'
            ].join('\n'),
            flags: ['all'],
            requiredClientPermissions: ['EMBED_LINKS']
        });
        this.usage = '[Command:command|Category:string], [Subcategory:string]';
        this.guarded = true;
    }

    async messageRun(msg, args) {
        const command = await args.pick('command').catch(() => args.rest('string').then(cats => cats.split(', ')).catch(() => null));

        if (command instanceof Command) {
            return reply(msg, {
                embeds: [new MessageEmbed()
                    .setTitle(`The \`${this.container.client.options.defaultPrefix}${command.name}\` command`)
                    .setDescription(command.description)
                    .addField('Usage', `\`${this.container.client.options.defaultPrefix}${getUsage(command)}\``)
                    .addField('Additional Information', command.detailedDescription || 'No additional information.')
                    .addField('Usage Legend', '`<required> [optional] (semirequired)` // `Name:type{min,max}`')
                    .setFooter({ text: `Classification: ${command.category} → ${command.subCategory}` })]
            });
        }

        const category = Array.isArray(command) ? command[0] : null;
        const subcategory = Array.isArray(command) ? command[1] : null;

        if (!args.getFlags('all') && msg.guild && msg.channel.permissionsFor(this.container.client.user).has('EMBED_LINKS')) {
            const display = await this.buildDisplay(msg, [category, subcategory]);
            if (display === null) return null;

            const myMsg = await msg.reply(`${this.container.constants.EMOTES.loading}  ::  Loading commands...`);
            return display.run(myMsg, msg.author).catch(err => this.container.logger.error(err));
        }

        return this.originalHelp(msg, args, [category, subcategory]);
    }

    async originalHelp(msg, args, [category, subcategory]) {
        const help = await this.buildHelp(msg, [category ? toTitleCase(category) : undefined, subcategory ? toTitleCase(subcategory) : undefined]);
        if (help === null) return null;
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading commands...`);
        const categories = Object.keys(help);
        const helpMessage = [];
        for (let cat = 0; cat < categories.length; cat++) {
            helpMessage.push(`**↞――――― __${categories[cat]} Commands__ ―――――↠**\n`);
            const subCategories = Object.keys(help[categories[cat]]);
            if (args.getFlags('all') || subcategory || category) for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`⇋ **[ ${subCategories[subCat]} ]** ⇋\n`, `${help[categories[cat]][subCategories[subCat]].join('\n')}\n`, '\u200b'); // eslint-disable-line max-len
            else for (let subCat = 0; subCat < subCategories.length; subCat++) helpMessage.push(`⇒ ${subCategories[subCat]}`, '\u200b');
            if (cat === categories.length - 1) {
                if (!args.getFlags('all')) {
                    helpMessage.push(
                        `\n**${'\\*'.repeat(75)}**`,
                        `***Say \`${this.container.client.options.defaultPrefix}help <category>\` (e.g. \`${this.container.client.options.defaultPrefix}help Music\`) to get the commands for that category.***`,
                        `***Say \`${this.container.client.options.defaultPrefix}help <category>, <subcategory>\` (e.g. \`${this.container.client.options.defaultPrefix}help Music, Control\`) to get the commands of a specific subcategory.***`,
                        `**${'\\*'.repeat(75)}**`,
                        '\u200b'
                    );
                }
                helpMessage.push([
                    this.container.client.application.botPublic ? [
                        `\nWant to add ${this.container.client.user.username} to your own server or to a server you manage? If you have **Manage Server** permissions, you can add this bot by using the link:`,
                        `<https://bit.ly/invite-stalwartle>`,
                        '\nNeed help or has ideas for the bot? Just want somewhere to hang out? Be with us here:',
                        `**${this.container.client.guilds.cache.get('502895390807293963').name}** ⇒ https://discord.gg/KDWGvV8`,
                        `\nUse the command \`${this.container.client.options.defaultPrefix}bug\` to report a bug and \`${this.container.client.options.defaultPrefix}suggest\` if you have suggestions.`,
                        '\n__**DONATION PERKS**__',
                        '$3 ⇒ Enable the history and playlist features.',
                        '$5 ⇒ Removal of 5-hour limit for each track in music. ($3 perk is included)',
                        // '$8 ⇒ Autoplay songs (add related videos when queue is empty). Only applicable for YouTube videos. ($3 and $5 perks are included)',
                        '$10 ⇒ Make bot not leave within 30 seconds when no one is connected to voice channel; unless the bot is rebooted. ($3 and $5 perks are included)',
                        '**Cryptocurrency Channel**: <https://nowpayments.io/donation/dwigoric>',
                        '**Fiat Channels**',
                        'PayPal: <https://www.paypal.com/donate/?hosted_button_id=C7FW3HGK8HQ9S>',
                        'Ko-fi: <https://ko-fi.com/dwigoric>',
                        'Patreon: <https://patreon.com/Dwigoric>',
                        `*AFTER donating, contact ${(await this.container.client.users.fetch(this.container.client.options.ownerID)).tag} or go to my support server to avail of these perks.*`
                    ].join('\n') : '',
                    `\nBot developed by **${this.container.client.application.owner}**, from 🇵🇭 with ❤`,
                    '💡 **ProTip #1**: Prefixes and commands are **case-insensitive**.',
                    `💡 **ProTip #2**: By using \`${this.container.client.options.defaultPrefix}help (command)\`, you can get the command's additional information!`,
                    '💡 **ProTip #3**: Getting tired of retyping the commands because you made a typo? Worry not! Just edit your message and the bot will edit the response accordingly!',
                    `💡 **ProTip #4**: You do not want to use some commands in your server? Just use \`${this.container.client.options.defaultPrefix}conf set disabledCommands <command>\`!`,
                    `💡 **ProTip #5**: Having fun with the \`${this.container.client.options.defaultPrefix}conf\` command? To access folders in e.g. \`show\` subcommand, use \`${this.container.client.options.defaultPrefix}conf show <folder>\`. To access items inside the folder, use \`${this.container.client.options.defaultPrefix}conf show <folder>.<item>\`.` // eslint-disable-line max-len
                ].join('\n'));
            }
        }

        return Promise.all(splitMessage(helpMessage.join('\n'), { char: '\u200b' }).map(helpMsgPart => msg.author.send(helpMsgPart)))
            .then(() => { if (msg.channel.type !== 'DM') reply(msg, '📫  ::  The list of commands you have access to has been sent to our DMs!'); })
            .catch(() => { if (msg.channel.type !== 'DM') reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You have DMs disabled, so I could not send you the command list in DMs.`); });
    }

    async buildHelp(msg, [category, subcategory]) {
        const help = {};

        const commandNames = [...this.container.stores.get('commands').keys()];
        const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

        let cmds = null;
        if (!category && !subcategory) cmds = this.container.stores.get('commands');
        if (category) {
            if (!this.container.stores.get('commands').map(cmd => cmd.category).includes(category)) {
                reply(msg, `${this.container.constants.EMOTES.xmark}  ::  **${category}** is not a valid category!`);
                return null;
            }
            cmds = this.container.stores.get('commands').filter(cmd => cmd.category === category);
        }
        if (subcategory) {
            if (!this.container.stores.get('commands').map(cmd => cmd.subCategory).includes(subcategory)) {
                reply(msg, `${this.container.constants.EMOTES.xmark}  ::  **${subcategory}** is not a valid subcategory!`);
                return null;
            }
            cmds = this.container.stores.get('commands').filter(cmd => cmd.category === category && cmd.subCategory === subcategory);
        }

        await Promise.all(cmds.map(async command => {
            if (!(await this.container.stores.get('preconditions').get('DevsOnly').run(msg)).success && command.category === 'Admin' && command.subCategory === 'Bot Owner') return null;
            const cat = category || command.category;
            const subCat = subcategory || command.subCategory;
            if (!Object.prototype.hasOwnProperty.call(help, cat)) help[cat] = {};
            if (!Object.prototype.hasOwnProperty.call(help[cat], subCat)) help[cat][subCat] = [];
            const description = typeof command.description === 'function' ? command.description(msg.language) : command.description;
            return help[cat][subCat].push(`\`${this.container.client.options.defaultPrefix}${command.name.padEnd(longest)}\` ⇒ ${description}`);
        }));

        if (!Object.keys(help).length) {
            reply(msg, `${this.container.constants.EMOTES.xmark}  ::  It would seem that **${subcategory}** is not under **${category}**.`);
            return null;
        }
        return help;
    }

    async buildDisplay(message, [maincategory, subcategory]) {
        const commands = await this._fetchCommands(message, [maincategory ? toTitleCase(maincategory) : undefined, subcategory ? toTitleCase(subcategory) : undefined]);
        if (commands === null) return null;
        const { prefix } = this.container.stores.get('gateways').get('guildGateway').get(message.guild.id);
        const display = new LazyPaginatedMessage({
            embedFooterSeparator: '|',
            template: {
                content: `${this.container.constants.EMOTES.tick}  ::  Command list loaded!`,
                embeds: [new MessageEmbed().setFooter({ text: `To know more about Donation Perks and ProTips from our developers, say \`${this.container.client.options.defaultPrefix}help\` in DMs with Stalwartle!` })]
            }
        });
        const color = message.member.displayColor;
        for (const [category, list] of commands) {
            display.addPageEmbed(new MessageEmbed()
                .setTitle(`${category} Commands`)
                .setColor(color)
                .setDescription(list.map(cmd => formatCommand(prefix, true, cmd)).join('\n')));
        }

        return display;
    }

    async _fetchCommands(message, [maincategory, subcategory]) {
        const run = this.container.stores.get('preconditions').run.bind(this.container.stores.get('preconditions'), message);
        const commands = new Map();

        let cmds = null;
        if (!maincategory && !subcategory) cmds = this.container.stores.get('commands');
        if (maincategory) {
            if (!this.container.stores.get('commands').map(cmd => cmd.category).includes(maincategory)) {
                reply(message, `${this.container.constants.EMOTES.xmark}  ::  **${maincategory}** is not a valid category!`);
                return null;
            }
            cmds = this.container.stores.get('commands').filter(cmd => cmd.category === maincategory);
        }
        if (subcategory) {
            if (!this.container.stores.get('commands').map(cmd => cmd.subCategory).includes(subcategory)) {
                reply(message, `${this.container.constants.EMOTES.xmark}  ::  **${subcategory}** is not a valid subcategory!`);
                return null;
            }
            cmds = this.container.stores.get('commands').filter(cmd => cmd.category === maincategory && cmd.subCategory === subcategory);
        }

        await Promise.all(cmds.map(command => run(command)
            .then(async () => {
                if (!(await this.container.stores.get('preconditions').get('DevsOnly').run(message)).success && command.category === 'Admin' && command.subCategory === 'Bot Owner') return null;
                const category = commands.get(`${command.category} - ${command.subCategory}`);
                return category ? category.push(command) : commands.set(`${command.category} - ${command.subCategory}`, [command]);
            }).catch(() => {
                // noop
            })
        ));

        return commands;
    }

};
