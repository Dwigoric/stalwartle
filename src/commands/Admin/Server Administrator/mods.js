const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { GuildMember } = require('discord.js');

module.exports = class extends SubCommandPluginCommand {

    constructor(...args) {
        super(...args, {
            preconditions: ['AdminsOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Sets a moderator user/role.',
            detailedDescription: 'If no argument is provided, this will list the moderator roles and members.',
            subCommands: ['add', 'remove', { input: '', output: 'messageRun', default: true }]
        });
    }

    async messageRun(msg) {
        const { roles, users } = await this.container.client.gateways.guilds.get(msg.guild.id, 'moderators');
        const modRoles = roles.map(rl => {
            const modRole = msg.guild.roles.cache.get(rl);
            if (modRole) {
                return modRole.name;
            } else {
                const dummyArray = roles.concat([]).splice(roles.findIndex(rl), 1);
                this.container.client.gateways.guilds.update(msg.guild.id, { moderators: { roles: dummyArray } });
            }
            return null;
        });
        const modUsers = await Promise.all(users.map(async us => {
            const modUser = await msg.guild.members.fetch(us);
            if (modUser) {
                return modUser.user.tag;
            } else {
                const dummyArray = users.concat([]).splice(users.findIndex(us), 1);
                this.container.client.gateways.guilds.update(msg.guild.id, { moderators: { users: dummyArray } });
            }
            return null;
        }));
        [modRoles, modUsers].forEach(mods => mods.forEach(mod => { if (!mod) mods.splice(mods.indexOf(mod), 1); }));
        send(msg, `**Roles**:${modRoles.length ? `\n${modRoles.join(' **|** ')}` : ' ***None***'}\n**Users**:${modUsers.length ? `\n${modUsers.join(' **|** ')}` : ' ***None***'}`);
    }

    async add(msg, args) {
        return this.toggle(msg, args, 'add');
    }

    async remove(msg, args) {
        return this.toggle(msg, args, 'remove');
    }

    async toggle(msg, args, action) {
        const mod = args.pick('member').catch(() => args.pick('role')).catch(() => null);
        if (mod === null) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the user/role.`);

        const type = mod instanceof GuildMember ? 'users' : 'roles';
        const guildMods = await this.container.client.gateways.guilds.get(msg.guild.id, 'moderators');
        if (action === 'add' && guildMods[type].includes(mod.id)) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  This role/user is already a moderator!`);
        if (action === 'remove' && !guildMods[type].includes(mod.id)) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  This role/user is already not a moderator!`);

        this.container.client.gateways.guilds.update(msg.guild.id, { moderators: { [type]: mod.id } });
        return send(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully ${action}${action.slice(-1) === 'e' ? '' : 'e'}d as moderator.`);
    }

};
