const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		this.client.channels.get('566764359691534342').send('@here **Pay will be given in a moment and after this, payban period will start! Please stay in base for at least 1 hour after claiming pay in order to not be put on payban.**'); // eslint-disable-line max-len
	}

	async init() {
		// Create a schedule to make this task work
		if (this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-pbstart').length === 1) return;
		do {
			this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-pbstart').forEach(tk => this.client.schedule.delete(tk.id));
			await this.client.schedule.create('cia-pbstart', '0 5,11,17,23 * * *');
		} while (this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-pbstart').length !== 1);
	}

};
