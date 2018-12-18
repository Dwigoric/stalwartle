const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		for (const { id } of await this.client.providers.default.getAll('music')) {
			const { queue, playlist, history } = await this.client.providers.default.get('music', id);
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
