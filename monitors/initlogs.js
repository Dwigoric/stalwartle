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
		const defProvider = this.client.providers.default;
		if (await this.client.providers.default.get('modlogs', msg.guild.id)) return;
		await defProvider.create('modlogs', msg.guild.id);
		await defProvider.update('modlogs', msg.guild.id, { modlogs: [] });
	}

};
