const Task = require('../lib/structures/tasks/Task');

module.exports = class extends Task {

    async run() {
        for (const { history, id } of await this.client.provider.getAll('music')) {
            this.client.gateways.music.update(id, { history: history.filter(hist => (Date.now() - hist.timestamp) <= (1000 * 60 * 60 * 24)) });
        }

        // Create a schedule to make this task work
        if (this.client.settings.schedules.filter(tk => tk.taskName === this.name).length >= 1) return;
        await this.client.schedule.create(this.name, '*/7 * * * *');
    }

    async init() {
        this.run();
    }

};
