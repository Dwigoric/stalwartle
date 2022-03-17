const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { toTitleCase } = require('@sapphire/utilities');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['setlogs'],
            requiredUserPermissions: 'MANAGE_GUILD',
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Configures the modlog channel in the server.',
            detailedDescription: [
                'If you want to configure the modlog for all moderation actions, do not use any subcommand.',
                'If you want to reset the modlog channels, use the `reset` subcommand.',
                'If you want to reset the modlog channel for a specific moderation action, use `s.setlog <moderation action> reset`',
                'If you want to list the modlog channels each moderation action is assigned to, use the `list` subcommand.'
            ].join('\n'),
            subCommands: ['list', 'kick', 'ban', 'softban', 'unban', 'mute', 'unmute', 'reset', { input: 'default', default: true }]
        });
        this.usage = '[list|kick|ban|softban|unban|mute|unmute|reset] (reset|Modlog:channel)';
    }

    async list(msg) {
        const modlogs = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'modlogs');
        const channels = msg.guild.channels.cache;
        return reply(msg, this.container.client.commands
            .filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action')
            .map(action => `${toTitleCase(action.name)}s: ${modlogs[action.name] ? channels.get(modlogs[action.name]) : 'Not yet set.'}`)
            .join('\n'));
    }

    async default(msg, args) {
        let modlog = await args.pickResult('guildTextChannel');
        if (!modlog.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the modlog channel.`);
        modlog = modlog.value;
        if (!modlog.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  It seems that I cannot post messages on that channel.`);

        this.container.stores.get('commands').filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cd => cd.name).forEach(action => this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, `modlogs.${action}`, modlog.id)); // eslint-disable-line max-len
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully updated the modlog channel for all moderation actions to ${modlog}.`);
    }

    async reset(msg) {
        this.container.stores.get('commands').filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action').map(cd => cd.name).forEach(action => this.container.stores.get('gateways').get('guildGateway').reset(msg.guild.id, `modlogs.${action}`)); // eslint-disable-line max-len
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully reset the modlog channel for all moderation actions.`);
    }

    async kick(msg, args) {
        return await this.#indivSet(msg, args, 'kick');
    }

    async ban(msg, args) {
        return await this.#indivSet(msg, args, 'ban');
    }

    async softban(msg, args) {
        return await this.#indivSet(msg, args, 'softban');
    }

    async unban(msg, args) {
        return await this.#indivSet(msg, args, 'unban');
    }

    async mute(msg, args) {
        return await this.#indivSet(msg, args, 'mute');
    }

    async unmute(msg, args) {
        return await this.#indivSet(msg, args, 'unmute');
    }

    async #indivSet(msg, args, action) {
        let modlog = await args.pickResult('guildTextChannel');
        if (!modlog.success) modlog = await args.pickResult('enum', { enum: ['reset'] });
        if (!modlog.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the text channel to log, or type \`reset\` in its place to reset logs for this type.`);
        modlog = modlog.value;

        if (modlog === 'reset') this.container.stores.get('gateways').get('guildGateway').reset(msg.guild.id, `modlogs.${action}`);
        else if (!modlog.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  It seems that I cannot post messages on that channel.`);
        else this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, `modlogs.${action}`, modlog.id);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully updated the modlog channel for member ${action}s to ${modlog}.`);
    }

};
