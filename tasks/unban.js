const { Task } = require('klasa');

module.exports = class extends Task {

	async run({ user, guild }) {
		const _guild = this.client.guilds.get(guild);
		if (!await _guild.fetchBans().then(bans => bans.has(user))) return null;
		const _user = await this.client.users.fetch(user).catch(() => null);
		this.client.finalizers.get('modlogging').run({
			command: this.client.commands.get('unban'),
			guild: _guild
		}, [_user, 'Auto Unban']);
		return _guild.members.unban(_user, 'Auto Unban');
	}

};
