const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ['MANAGE_ROLES'],
            runIn: ['text'],
            description: 'Unmutes a mentioned user.',
            usage: '<Member:member> [Reason:string] [...]',
            usageDelim: ' '
        });
    }

    async run(msg, [member, ...reason]) {
        reason = reason.length ? reason.join(this.usageDelim) : null;
        if (!msg.guild.settings.get('muteRole')) throw `${this.container.client.constants.EMOTES.xmark}  ::  The mute role has not yet been set up for this server. You can do so by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`; // eslint-disable-line max-len
        if (member.user.equals(msg.author)) throw 'Look... how are you able to use this command if you were already unmuted?';
        if (member.user.equals(this.container.client.user)) throw '*Unmutes self*. Oh, I would not have been able to respond if I were in the first place!';

        const user = await this.container.client.users.fetch(member.id).catch(() => null);
        const muteRole = msg.guild.roles.cache.get(msg.guild.settings.get('muteRole'));
        if (!muteRole) throw `${this.container.client.constants.EMOTES.xmark}  ::  Whoops! The mute role has been deleted. Please reconfigure this server's mute role by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`; // eslint-disable-line max-len
        if (muteRole.position >= msg.guild.me.roles.highest.position) throw `${this.container.client.constants.EMOTES.xmark}  ::  The mute role **${muteRole.name}** is higher than me, so I can't take from ${user.tag} the mute role.`; // eslint-disable-line max-len
        if (!member.roles.cache.has(muteRole.id)) throw `${this.container.client.constants.EMOTES.xmark}  ::  ${user.tag} wasn't muted already!`;

        await member.roles.remove(muteRole, 'Unmuted');
        await msg.guild.settings.update('muted', member.user.id, { arrayAction: 'remove' });
        const task = this.container.client.schedule.tasks.filter(tk => tk.taskName === 'unmute' && tk.data.user === user.id)[0];
        if (task) this.container.client.schedule.delete(task.id);

        msg.channel.send(`${this.container.client.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been unmuted. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, user, reason);
    }

};
