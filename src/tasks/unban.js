const Task = require('../lib/structures/tasks/Task');

module.exports = class extends Task {

    async run({ user, guild }) {
        const _guild = this.container.client.guilds.cache.get(guild);
        if (!await _guild.fetchBans().then(bans => bans.has(user))) return null;
        const _user = await this.container.client.users.fetch(user).catch(() => null);
        this.container.client.emit('modlogAction', {
            command: this.container.client.commands.get('unban'),
            guild: _guild
        }, _user, 'Auto Unban');
        return _guild.members.unban(_user, 'Auto Unban');
    }

};
