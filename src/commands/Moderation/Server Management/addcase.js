const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Adds cases to modlog in case of a manual action.',
            usage: '<kick|ban|unban|softban|mute|unmute> <Target:user> [Duration:duration] [Reason:string] [...]',
            usageDelim: ' ',
            subcommands: true
        });
    }

    async kick(msg, [target, , ...reason]) {
        if (reason) reason = reason.join(this.usageDelim);
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_KICK' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) throw `${this.container.client.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you kicked **${target.tag}**.`; // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('kick');
        this.container.client.emit('modlogAction', msg, target, reason);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully added a kick case for ${target.tag}! Check the modlogs via \`${msg.guild.settings.get('prefix')}modlogs\`.`);
    }

    async ban(msg, [target, duration, ...reason]) {
        if (reason) reason = reason.join(this.usageDelim);
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_BAN' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) throw `${this.container.client.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you banned **${target.tag}**.`; // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('ban');
        this.container.client.emit('modlogAction', msg, target, reason, duration);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully added a ban case for ${target.tag}! Check the modlogs via \`${msg.guild.settings.get('prefix')}modlogs\`.`);
    }

    async unban(msg, [target, , ...reason]) {
        if (reason) reason = reason.join(this.usageDelim);
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_UNBAN' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) throw `${this.container.client.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you unbanned **${target.tag}**.`; // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('unban');
        this.container.client.emit('modlogAction', msg, target, reason);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully added an unban case for ${target.tag}! Check the modlogs via \`${msg.guild.settings.get('prefix')}modlogs\`.`);
    }

    async softban(msg, [target, , ...reason]) {
        if (reason) reason = reason.join(this.usageDelim);
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_BAN' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) throw `${this.container.client.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you banned **${target.tag}**.`; // eslint-disable-line max-len
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_UNBAN' && entry.executor.id === msg.author.id && entry.target.id === target.id).size) throw `${this.container.client.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you unbanned **${target.tag}**.`; // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('softban');
        this.container.client.emit('modlogAction', msg, target, reason);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully added a softban case for ${target.tag}! Check the modlogs via \`${msg.guild.settings.get('prefix')}modlogs\`.`);
    }

    async mute(msg, [target, duration, ...reason]) {
        if (reason) reason = reason.join(this.usageDelim);
        if (!msg.guild.settings.get('muteRole')) throw `${this.container.client.constants.EMOTES.xmark}  ::  The mute role has not yet been set up for this server. You can do so by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`; // eslint-disable-line max-len
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_ROLE_UPDATE' && entry.executor.id === msg.author.id && entry.target.id === target.id && entry.changes[0].key === '$add' && entry.changes[0].new && entry.changes[0].new[0].id === msg.guild.settings.get('muteRole')).size) throw `${this.container.client.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you gave the muterole to **${target.tag}**.`; // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('mute');
        this.container.client.emit('modlogAction', msg, target, reason, duration);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully added a mute case for ${target.tag}! Check the modlogs via \`${msg.guild.settings.get('prefix')}modlogs\`.`);
    }

    async unmute(msg, [target, , ...reason]) {
        if (reason) reason = reason.join(this.usageDelim);
        if (!msg.guild.settings.get('muteRole')) throw `${this.container.client.constants.EMOTES.xmark}  ::  The mute role has not yet been set up for this server. You can do so by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`; // eslint-disable-line max-len
        if (!(await msg.guild.fetchAuditLogs()).entries.filter(entry => entry.action === 'MEMBER_ROLE_UPDATE' && entry.executor.id === msg.author.id && entry.target.id === target.id && entry.changes[0].key === '$remove' && entry.changes[0].old && entry.changes[0].old[0].id === msg.guild.settings.get('muteRole')).size) throw `${this.container.client.constants.EMOTES.xmark}  ::  The server audit logs show that there are no instances that you took the muterole from **${target.tag}**.`; // eslint-disable-line max-len
        msg.command = this.container.client.commands.get('unmute');
        this.container.client.emit('modlogAction', msg, target, reason);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully added an unmute case for ${target.tag}! Check the modlogs via \`${msg.guild.settings.get('prefix')}modlogs\`.`);
    }

};
