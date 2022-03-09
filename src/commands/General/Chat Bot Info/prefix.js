const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Changes the bot prefix server-wide, or simply displays the current prefix.'
        });
    }

    async messageRun(msg, args) {
        const newPrefix = await args.pick('string').catch(() => null);
        const prefix = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix');

        if (!newPrefix || !msg.member.permissions.has('MANAGE_GUILD')) {
            return reply(msg, [
                `The prefix for this server is currently \`${prefix}\`.`,
                msg.member.permissions.has('MANAGE_GUILD') ? ` Please use \`${prefix}prefix <prefix>\` to change the server prefix.` : ''
            ].join(''));
        }
        this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, 'prefix', newPrefix);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  The prefix for **${msg.guild.name}** is now \`${newPrefix}\`.`);
    }

};
