const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild) return;
		this.checkTable(msg.guild.id, 'modlogs');
		this.checkTable(msg.guild.id, 'music');
	}

	async checkTable(guild, table) {
		const defProvider = this.client.providers.default;
		if (await this.client.providers.default.get(table, guild)) return;
		await defProvider.create(table, guild);
		await defProvider.update(table, guild, { [table]: [] });
	}

};
