const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 5000,
            cooldownLimit: 3,
            description: 'Sets the role to be assigned to either bots or users when they join the server.',
            detailedDescription: "In case I can't assign the role, I will send the server owner why.",
            requiredUserPermissions: ['ADMINISTRATOR'],
            requiredClientPermissions: ['MANAGE_ROLES'],
            runIn: [CommandOptionsRunTypeEnum.GuildText]
        });
    }

    async messageRun(msg, args) {
        let type = await args.pickResult('string');
        if (!role.success || !['bot', 'user'].includes(type.value)) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  You must supply the scope of the autorole.`);
        type = type.value;

        let role = await args.pickResult('role');
        if (!role.success) role = await args.pickResult('string');
        if (!role.success || role.value !== 'remove') return send(msg, `${this.container.constants.EMOTES.xmark}  ::  You must supply a role or the word \`remove\`.`);
        role = role.value;

        if (role === 'remove') {
            this.container.stores.get('gateways').get('guildGateway').reset(msg.guild.id, `autorole.${type}`);
            return send(msg, `${this.container.constants.EMOTES.tick}  ::  The autorole for ${type}s has been removed!`);
        }
        if (!role) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  Whoops! I think **${role}** doesn't exist... Maybe use the role's ID instead?`);
        if (role.position >= msg.guild.me.roles.highest.position) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! That role is higher than mine!`);
        if (role.position >= msg.member.roles.highest.position) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  It seems that role is higher than yours...`);
        this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, `autorole.${type}`, role.id);
        return send(msg, `${this.container.constants.EMOTES.tick}  ::  The autorole for ${type}s has been set to **${role.name}**.`);
    }


};
