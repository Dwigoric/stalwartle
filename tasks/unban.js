const { Task } = require('klasa');

module.exports = class extends Task {

	async run({ user, guild }) {
		const _guild = this.client.guilds.get(guild);
		const _user = await this.client.users.fetch(user).catch(() => null);
		this.client.finalizers.get('modlogging').run({
			command: this.client.commands.get('unban'),
			guild: _guild
		}, [_user, 'Auto Unban']);
		return _guild.members.unban(_user, 'Auto Unban');
	}

};
