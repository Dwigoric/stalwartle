const { Task } = require('@sapphire/framework');

module.exports = class extends Task {

	async run() {
		for (const { history, id } of await this.client.providers.default.getAll('music')) {
			this.client.providers.default.update('music', id, { history: history.filter(hist => (Date.now() - hist.timestamp) <= (1000 * 60 * 60 * 24)) });
		}

		// Create a schedule to make this task work
		if (this.client.settings.get('schedules').filter(tk => tk.taskName === this.name).length >= 1) return;
		await this.client.schedule.create(this.name, '*/7 * * * *');
	}

	async init() {
		this.run();
	}

};
