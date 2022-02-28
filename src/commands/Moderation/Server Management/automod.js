const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredUserPermissions: ['MANAGE_GUILD'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Sets the automod settings for the server.',
            detailedDescription: [
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
            subCommands: ['invite', 'swear', 'spam', 'mentionspam', 'quota', 'ignorebots', 'ignoremods']
        });
    }

    async invite(msg, args) {
        let option = await args.pickResult('string');
        if (!option.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide whether to enable or disable, or the action associated with the module.`);
        option = option.value;

        const modcommands = this.container.stores.get('commands').filter(cmd => !['unban', 'unmute'].includes(cmd.name) && cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cmd => cmd.name);

        if (['enable', 'disable'].includes(option)) {
            this.#setAutoMod(msg.guild.id, option, 'antiInvite');
            return reply(msg, `${this.container.constants.EMOTES.tick}  ::  The AntiInvite module has been ${option}d on ${msg.guild.name}.`);
        } else if (modcommands.includes(option)) {
            this.#changeAction(msg.guild.id, option, 'antiInvite');
            return reply(msg, `${this.container.constants.EMOTES.tick}  :: The AntiInvite module now uses the **${option}** action.`);
        } else {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid option.`);
        }
    }

    async swear(msg, args) {
        let option = await args.pickResult('string');
        if (!option.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide whether to enable or disable, or the action associated with the module.`);
        option = option.value;

        const modcommands = this.container.stores.get('commands').filter(cmd => !['unban', 'unmute'].includes(cmd.name) && cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cmd => cmd.name);

        if (['enable', 'disable'].includes(option)) {
            this.#setAutoMod(msg.guild.id, option, 'antiSwear');
            return reply(msg, `${this.container.constants.EMOTES.tick}  ::  The AntiSwear module has been ${option}d on ${msg.guild.name}.`);
        } else if (modcommands.includes(option)) {
            this.#changeAction(msg.guild.id, option, 'antiSwear');
            return reply(msg, `${this.container.constants.EMOTES.tick}  :: The AntiSwear module now uses the **${option}** action.`);
        } else {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid option.`);
        }
    }

    async spam(msg, args) {
        let option = await args.pickResult('string');
        if (!option.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide whether to enable or disable, or the action associated with the module.`);
        option = option.value;

        const modcommands = this.container.stores.get('commands').filter(cmd => !['unban', 'unmute'].includes(cmd.name) && cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cmd => cmd.name);

        if (['enable', 'disable'].includes(option)) {
            this.#setAutoMod(msg.guild.id, option, 'antiSpam');
            return reply(msg, `${this.container.constants.EMOTES.tick}  ::  The AntiSpam module has been ${option}d on ${msg.guild.name}.`);
        } else if (modcommands.includes(option)) {
            this.#changeAction(msg.guild.id, option, 'antiSpam');
            return reply(msg, `${this.container.constants.EMOTES.tick}  :: The AntiSpam module now uses the **${option}** action.`);
        } else {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid option.`);
        }
    }

    async mentionspam(msg, args) {
        let option = await args.pickResult('string');
        if (!option.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide whether to enable or disable, or the action associated with the module.`);
        option = option.value;

        const modcommands = this.container.stores.get('commands').filter(cmd => !['unban', 'unmute'].includes(cmd.name) && cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cmd => cmd.name);

        if (['enable', 'disable'].includes(option)) {
            this.#setAutoMod(msg.guild.id, option, 'mentionSpam');
            return reply(msg, `${this.container.constants.EMOTES.tick}  ::  The MentionSpam module has been ${option}d on ${msg.guild.name}.`);
        } else if (modcommands.includes(option)) {
            this.#changeAction(msg.guild.id, option, 'mentionSpam');
            return reply(msg, `${this.container.constants.EMOTES.tick}  :: The MentionSpam module now uses the **${option}** action.`);
        } else {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid option.`);
        }
    }

    async quota(msg, args) {
        let option = await args.pickResult('string');
        if (!option.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide whether to enable or disable, or the action associated with the module.`);
        option = option.value;

        const modcommands = this.container.stores.get('commands').filter(cmd => !['unban', 'unmute'].includes(cmd.name) && cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cmd => cmd.name);

        if (['enable', 'disable'].includes(option)) {
            this.#setAutoMod(msg.guild.id, option, 'quota');
            return reply(msg, `${this.container.constants.EMOTES.tick}  ::  The Action Quota has been ${option}d on ${msg.guild.name}.`);
        } else if (modcommands.includes(option)) {
            this.#changeAction(msg.guild.id, option, 'quota');
            return reply(msg, `${this.container.constants.EMOTES.tick}  :: The Action Quota module now uses the ${option} action.`);
        } else {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid option.`);
        }
    }

    async ignorebots(msg, args) {
        let option = await args.pickResult('string');
        if (!option.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the action associated with the module.`);
        option = option.value;

        const _option = this.#setAutoMod(msg.guild.id, option, 'ignoreBots');
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Automod actions will now be ${_option ? 'not ' : ''}applied on bots in ${msg.guild.name}.`);
    }

    async ignoremods(msg, args) {
        let option = await args.pickResult('string');
        if (!option.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the action associated with the module.`);
        option = option.value;

        const _option = this.#setAutoMod(msg.guild.id, option, 'ignoreMods');
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Automod actions will now be ${_option ? 'not ' : ''}applied on moderators in ${msg.guild.name}.`);
    }

    #setAutoMod(guild, option, type) {
        const _option = option === 'enable';
        this.container.stores.get('gateways').get('guildGateway').update(guild, `automod.${type}`, _option);
        return _option;
    }

    #changeAction(guild, option, type) {
        // eslint-disable-next-line max-len
        if (!['antiInvite', 'antiSwear', 'antiSpam', 'mentionSpam', 'quota'].includes(type)) throw `${this.container.constants.EMOTES.xmark}  ::  The \`${option}\` option is only applicable for automod modules.`;
        this.container.stores.get('gateways').get('guildGateway').update(guild, `automod.options.${type}`, option);
    }

    async messageRun(msg) {
        return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the automod module or filter you want to modify.`);
    }

};
