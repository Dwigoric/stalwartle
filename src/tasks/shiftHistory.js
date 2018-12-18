const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		for (const { history, id, playlist, queue } of await this.client.providers.default.getAll('music')) {
			this.client.providers.default.update('music', id, {
				queue,
				playlist,
				history: history.filter(hist => (Date.now() - hist.timestamp) <= (1000 * 60 * 60 * 24))
			});
		}

		// Create a schedule to make this task work
		while (this.client.schedule.tasks.filter(tk => tk.taskName === 'shiftHistory').length !== 1) {
			this.client.schedule.tasks.filter(tk => tk.taskName === 'shiftHistory').forEach(tk => this.client.schedule.delete(tk.id));
			await this.client.schedule.create('shiftHistory', '*/7 * * * *');
		}
	}

	async init() {
		this.run();
	}

};
