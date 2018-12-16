const { Task } = require('klasa');

module.exports = class extends Task {

	async run({ guild }) {
		const { queue, playlist, history } = await this.client.providers.default.get('music', guild);
		history.shift();
		this.client.providers.default.update('music', guild, { queue, playlist, history });
	}

};
