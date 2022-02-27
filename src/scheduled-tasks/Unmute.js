const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');

module.exports = class extends ScheduledTask {

    async run({ user, guild, role }) {
        const _guild = this.container.client.guilds.cache.get(guild);
        const _role = _guild.roles.cache.get(role);
        const member = await _guild.members.fetch(user).catch(() => null);
        this.container.client.emit('modlogAction', {
            command: this.container.client.commands.get('unmute'),
            guild: _guild
        }, await this.container.client.users.fetch(user), 'Auto Unmute');
        if (!member) return guild.settings.update('guild.muted', user, { muted: false });
        if (!member.roles.cache.has(role)) return null;
        member.roles.remove(_role, 'Auto Unmute');
        return member.guild.settings.update('muted', user, { arrayAction: 'remove' });
    }

};
