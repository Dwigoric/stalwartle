const { Command } = require('@sapphire/framework');
const { GuildMember } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 8,
            runIn: ['text'],
            description: 'Sets a moderator user/role.',
            extendedHelp: 'If no argument is provided, this will list the moderator roles and members.',
            usage: '[add|remove] (Member:member|Role:role) [...]',
            usageDelim: ' ',
            subcommands: true
        });

        this
            .createCustomResolver('member', (arg, possible, msg, [action]) => {
                if (['add', 'remove'].includes(action) && !arg) throw `${this.container.client.constants.EMOTES.xmark}  ::  Please provide the user/role.`;
                if (arg && !['add', 'remove'].includes(action)) throw `${this.container.client.constants.EMOTES.xmark}  ::  Please specify if the role/user should be added or removed.`;
                if (!arg) return undefined;
                return this.container.client.arguments.get('member').run(arg, possible, msg);
            })
            .createCustomResolver('role', (arg, possible, msg, [action]) => {
                if (['add', 'remove'].includes(action) && !arg) throw `${this.container.client.constants.EMOTES.xmark}  ::  Please provide the user/role.`;
                if (arg && !['add', 'remove'].includes(action)) throw `${this.container.client.constants.EMOTES.xmark}  ::  Please specify if the role/user should be added or removed.`;
                if (!arg) return undefined;
                return this.container.client.arguments.get('role').run(arg, possible, msg);
            });
    }

    async messagemessageRun(msg) {
        const { roles, users } = await msg.guild.settings.get('moderators');
        const modRoles = roles.map(rl => {
            const modRole = msg.guild.roles.cache.get(rl);
            if (modRole) return modRole.name;
            else msg.guild.settings.update('moderators.roles', rl, msg.guild, { arrayAction: 'remove' });
            return null;
        });
        const modUsers = await Promise.all(users.map(async us => {
            const modUser = await msg.guild.members.fetch(us);
            if (modUser) return modUser.user.tag;
            else msg.guild.settings.update('moderators.users', us, msg.guild, { arrayAction: 'remove' });
            return null;
        }));
        [modRoles, modUsers].forEach(mods => mods.forEach(mod => { if (!mod) mods.splice(mods.indexOf(mod), 1); }));
        msg.send(`**Roles**:${modRoles.length ? `\n${modRoles.join(' **|** ')}` : ' ***None***'}\n**Users**:${modUsers.length ? `\n${modUsers.join(' **|** ')}` : ' ***None***'}`);
    }

    async add(msg, [mod]) {
        return this.toggle(msg, mod, 'add');
    }

    async remove(msg, [mod]) {
        return this.toggle(msg, mod, 'remove');
    }

    async toggle(msg, mod, arrayAction) {
        const type = mod instanceof GuildMember ? 'users' : 'roles';
        const guildMods = await msg.guild.settings.get('moderators');
        if (arrayAction === 'add' && guildMods[type].includes(mod.id)) throw `${this.container.client.constants.EMOTES.xmark}  ::  This role/user is already a moderator!`;
        if (arrayAction === 'remove' && !guildMods[type].includes(mod.id)) throw `${this.container.client.constants.EMOTES.xmark}  ::  This role/user is already not a moderator!`;
        msg.guild.settings.update(`moderators.${type}`, mod.id, msg.guild, { arrayAction });
        msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully ${arrayAction}${arrayAction.slice(-1) === 'e' ? '' : 'e'}d as moderator.`);
    }

};
