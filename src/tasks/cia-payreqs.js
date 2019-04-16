const { Task } = require('klasa');

module.exports = class extends Task {

	async run() {
		this.client.channels.get('566764359691534342').send([
			'@here **Pay requirements have started! Please make sure to be be at base and fill a station for at least one hour to claim pay!**',
			'In order to claim pay, you must meet all of the following requirements:',
			'• Employee must have 60 minutes or more of online time.',
			'• Employee must not be on pay ban list.',
			'• Actively filling stations, promoting and training.',
			'• You must stay in base for at least one hour actively filling stations, promoting and training.',
			'All staff MUST fulfill our requirements.'
		].join('\n'));
	}

	async init() {
		// Create a schedule to make this task work
		if (this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-payreqs').length === 1) return;
		do {
			this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-payreqs').forEach(tk => this.client.schedule.delete(tk.id));
			await this.client.schedule.create('cia-payreqs', '0 4,10,16,22 * * *');
		} while (this.client.schedule.tasks.filter(tk => tk.taskName === 'cia-payreqs').length !== 1);
	}

};
