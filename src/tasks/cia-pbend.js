const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		this.client.channels.get('566764359691534342').send('@here **Payban period has ended!** Feel free to go now, but it\'s much appreciated if you stay!'); // eslint-disable-line max-len
	}

	async init() {
		// Create a schedule to make this task work
		if (this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-pbend').length === 1) return;
		do {
			this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-pbend').forEach(tk => this.client.schedule.delete(tk.id));
			await this.client.schedule.create('cia-pbend', '0 0,6,12,18 * * *');
		} while (this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-pbend').length !== 1);
	}

};
