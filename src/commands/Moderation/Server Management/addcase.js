const { reply } = require('@sapphire/plugin-editable-commands');
const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Adds cases to modlog in case of a manual action.',
            subcommands: ['kick', 'ban', 'unban', 'softban', 'mute', 'unmute']
        });
    }

    async kick(msg, args) {
        let target = await args.pickResult('user');
        if (!target.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the target user of the audit log action.`);
        target = target.value;
        const reason = await args.rest('string').catch(() => null);

        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_KICK' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you kicked **${target.tag}**.`); // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('kick');
        this.container.client.emit('modlogAction', msg, target, reason);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully added a kick case for ${target.tag}! Check the modlogs via \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}modlogs\`.`);
    }

    async ban(msg, args) {
        let target = await args.pickResult('user');
        if (!target.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the target user of the audit log action.`);
        target = target.value;
        const duration = await args.pick('duration').catch();
        const reason = await args.rest('string').catch(() => null);

        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_BAN' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you banned **${target.tag}**.`); // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('ban');
        this.container.client.emit('modlogAction', msg, target, reason, duration);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully added a ban case for ${target.tag}! Check the modlogs via \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}modlogs\`.`);
    }

    async unban(msg, args) {
        let target = await args.pickResult('user');
        if (!target.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the target user of the audit log action.`);
        target = target.value;
        const reason = await args.rest('string').catch(() => null);

        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_UNBAN' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you unbanned **${target.tag}**.`); // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('unban');
        this.container.client.emit('modlogAction', msg, target, reason);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully added an unban case for ${target.tag}! Check the modlogs via \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}modlogs\`.`);
    }

    async softban(msg, args) {
        let target = await args.pickResult('user');
        if (!target.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the target user of the audit log action.`);
        target = target.value;
        const reason = await args.rest('string').catch(() => null);

        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_BAN' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you banned **${target.tag}**.`); // eslint-disable-line max-len
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_UNBAN' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you unbanned **${target.tag}**.`); // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('softban');
        this.container.client.emit('modlogAction', msg, target, reason);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully added a softban case for ${target.tag}! Check the modlogs via \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}modlogs\`.`);
    }

    async mute(msg, args) {
        let target = await args.pickResult('user');
        if (!target.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the target user of the audit log action.`);
        target = target.value;
        const duration = await args.pick('duration').catch();
        const reason = await args.rest('string').catch(() => null);

        if (!msg.guild.settings.get('muteRole')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The mute role has not yet been set up for this server. You can do so by using the \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}muterole\` command.`); // eslint-disable-line max-len
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_ROLE_UPDATE' && entry.executor.id === msg.author.id && entry.target.id === target.id && entry.changes[0].key === '$add' && entry.changes[0].new && entry.changes[0].new[0].id === msg.guild.settings.get('muteRole')).size) throw `${this.container.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you gave the muterole to **${target.tag}**.`; // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('mute');
        this.container.client.emit('modlogAction', msg, target, reason, duration);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully added a mute case for ${target.tag}! Check the modlogs via \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}modlogs\`.`);
    }

    async unmute(msg, args) {
        let target = await args.pickResult('user');
        if (!target.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the target user of the audit log action.`);
        target = target.value;
        const reason = await args.rest('string').catch(() => null);

        if (!msg.guild.settings.get('muteRole')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The mute role has not yet been set up for this server. You can do so by using the \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}muterole\` command.`); // eslint-disable-line max-len
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_ROLE_UPDATE' && entry.executor.id === msg.author.id && entry.target.id === target.id && entry.changes[0].key === '$remove' && entry.changes[0].old && entry.changes[0].old[0].id === msg.guild.settings.get('muteRole')).size) throw `${this.container.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you took the muterole from **${target.tag}**.`; // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('unmute');
        this.container.client.emit('modlogAction', msg, target, reason);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully added an unmute case for ${target.tag}! Check the modlogs via \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}modlogs\`.`);
    }

    async messageRun(msg) {
        return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please state the audit log action you want to add.`);
    }

};
