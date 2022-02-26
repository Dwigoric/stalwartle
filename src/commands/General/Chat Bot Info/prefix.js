const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Changes the bot prefix server-wide.',
            requiredUserPermissions: ['MANAGE_GUILD']
        });
    }

    async messageRun(msg, args) {
        const newPrefix = args.pick('string').catch(() => null);
        const prefix = msg.guild.settings.get('prefix');

        if (!newPrefix) return send(msg, `The prefix for this server is currently \`${prefix}\`. Please use \`${prefix}prefix <prefix>\` to change the server prefix.`);
        this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, 'prefix', newPrefix);
        return send(msg, `${this.container.constants.EMOTES.tick}  ::  The prefix for **${msg.guild.name}** is now \`${newPrefix}\`. Type \`@${this.container.client.user.tag}\` to get the current prefix.`);
    }

};
