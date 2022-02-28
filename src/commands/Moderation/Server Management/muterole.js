const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredUserPermissions: ['MANAGE_GUILD'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: 'MANAGE_ROLES',
            description: 'Sets the mute role for the server.',
            detailedDescription: 'Set the server\'s mute role using the name you provide.',
            subCommands: ['reset']
        });
    }

    async messageRun(msg, args) {
        let role = await args.restResult('string');
        if (!role.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the role name of the mute role.`);
        role = role.value;

        const newRole = await msg.guild.roles.create({
            name: role,
            color: 'DARKER_GREY',
            permissions: 0
        }).catch(() => null);
        if (!newRole) throw `${this.container.constants.EMOTES.xmark}  ::  I cannot create the muted role. Please double-check my permissions.`;
        this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, 'muteRole', newRole.id);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully set this server's mute role to **${newRole.name}**.`);
    }

    async reset(msg) {
        this.container.stores.get('gateways').get('guildGateway').reset(msg.guild.id, 'muteRole');
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully reset this server's mute role.`);
    }

};
