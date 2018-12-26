const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	async run(msg, command) {
		if (!msg.guild) return null;
		if (command.category === 'Moderation') return await this.checkTable(msg.guild.id, 'modlogs');
		if (command.category === 'Music') return await this.checkTable(msg.guild.id, 'music');
		return null;
	}

	async checkTable(guild, table) {
		const defProvider = this.client.providers.default;
		if (await this.client.providers.default.get(table, guild)) return null;
		await defProvider.create(table, guild);
		const obj = {
			modlogs: { modlogs: [] },
			music: { history: [], playlist: [], queue: [] }
		};
		return await defProvider.update(table, guild, obj[table]);
	}

};
