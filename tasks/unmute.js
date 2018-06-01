const { Task } = require('klasa');

module.exports = class extends Task {

	async run({ user, guild, role }) {
		const _guild = this.client.guilds.get(guild);
		const _role = _guild.roles.get(role);
		const member = await _guild.members.fetch(user).catch(() => null);
		if (!member.roles.has(role)) return null;
		this.client.finalizers.get('modlogging').run({
			command: this.client.commands.get('unmute'),
			guild: _guild
		}, [member.user, 'Auto Unmute']);
		return member.roles.remove(_role, 'Auto Unmute');
	}

};
