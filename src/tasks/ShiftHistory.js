const Task = require('../lib/structures/tasks/Task');

module.exports = class extends Task {

    async run() {
        for (const { history, id } of await this.container.client.provider.getAll('music')) {
            this.container.client.gateways.music.update(id, { history: history.filter(hist => (Date.now() - hist.timestamp) <= (1000 * 60 * 60 * 24)) });
        }

        // Create a schedule to make this task work
        if (this.container.client.settings.schedules.filter(tk => tk.taskName === this.name).length >= 1) return;
        await this.container.client.schedule.create(this.name, '*/7 * * * *');
    }

    async init() {
        this.run();
    }

};
