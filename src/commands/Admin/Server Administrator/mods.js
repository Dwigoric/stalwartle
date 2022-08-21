const { Subcommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { GuildMember } = require('discord.js');

module.exports = class extends Subcommand {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredUserPermissions: ['ADMINISTRATOR'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Sets a moderator user/role.',
            detailedDescription: 'If no argument is provided, this will list the moderator roles and members.',
            subCommands: ['add', 'remove', { input: 'default', default: true }]
        });
        this.usage = '[add|remove] (Member:member|Role:role) [...]';
    }

    async default(msg) {
        const { roles, users } = await this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'moderators');
        const modRoles = roles.map(rl => {
            const modRole = msg.guild.roles.cache.get(rl);
            if (modRole) return modRole.name;

            const dummyArray = roles.concat([]).splice(roles.findIndex(rl), 1);
            this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, { moderators: { roles: dummyArray } });
            return null;
        });
        const modUsers = await Promise.all(users.map(async us => {
            const modUser = await msg.guild.members.fetch(us);
            if (modUser) return modUser.user.tag;

            const dummyArray = users.concat([]).splice(users.findIndex(us), 1);
            this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, { moderators: { users: dummyArray } });
            return null;
        }));
        [modRoles, modUsers].forEach(mods => mods.forEach(mod => { if (!mod) mods.splice(mods.indexOf(mod), 1); }));
        reply(msg, `**Roles**:${modRoles.length ? `\n${modRoles.join(' **|** ')}` : ' ***None***'}\n**Users**:${modUsers.length ? `\n${modUsers.join(' **|** ')}` : ' ***None***'}`);
    }

    async add(msg, args) {
        return this.toggle(msg, args, 'add');
    }

    async remove(msg, args) {
        return this.toggle(msg, args, 'remove');
    }

    async toggle(msg, args, action) {
        const mod = await args.pick('member').catch(() => args.pick('role')).catch(() => null);
        if (mod === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the user/role.`);

        const type = mod instanceof GuildMember ? 'users' : 'roles';
        const guildMods = await this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'moderators');
        if (action === 'add' && guildMods[type].includes(mod.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  This role/user is already a moderator!`);
        if (action === 'remove' && !guildMods[type].includes(mod.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  This role/user is already not a moderator!`);

        switch (action) {
            case 'add':
                guildMods[type].push(mod.id);
                break;
            case 'remove':
                guildMods[type].splice(guildMods[type].indexOf(mod.id), 1);
                break;
            // no default
        }

        this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, { moderators: { [type]: guildMods[type] } });
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully ${action}${action.slice(-1) === 'e' ? '' : 'e'}d as moderator.`);
    }

};
