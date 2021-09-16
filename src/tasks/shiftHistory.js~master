const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		for (const { history, id } of await this.client.providers.default.getAll('music')) {
			if (!history) continue;
			this.client.providers.default.update('music', id, { history: history.filter(hist => (Date.now() - hist.timestamp) <= (1000 * 60 * 60 * 24)) });
		}
	}

	async init() {
		this.run();
	}

};
