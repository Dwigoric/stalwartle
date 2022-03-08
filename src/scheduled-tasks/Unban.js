const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');

module.exports = class extends ScheduledTask {

    async run({ user, guild }) {
        const _guild = this.container.client.guilds.cache.get(guild);
        if (!await _guild.fetchBans().then(bans => bans.has(user))) return null;
        const _user = await this.container.client.users.fetch(user).catch(() => null);
        return this.container.client.emit('modlogAction', 'unban', this.container.client.user, _user, _guild, { reason: 'Auto Unban' });
    }

};
