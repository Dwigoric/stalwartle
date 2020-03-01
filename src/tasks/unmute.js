const { Task } = require('klasa');

module.exports = class extends Task {

	async run({ user, guild, role }) {
		const _guild = this.client.guilds.cache.get(guild);
		const _role = _guild.roles.cache.get(role);
		const member = await _guild.members.fetch(user).catch(() => null);
		this.client.emit('modlogAction', {
			command: this.client.commands.get('unmute'),
			guild: _guild
		}, await this.client.users.fetch(user), 'Auto Unmute');
		if (!member) return this.client.providers.default.update('members', `${guild}.${user}`, { muted: false });
		if (!member.roles.has(role)) return null;
		member.roles.remove(_role, 'Auto Unmute');
		member.settings.reset('muted');
		return member.settings.sync();
	}

};
