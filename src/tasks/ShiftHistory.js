const Task = require('../lib/structures/tasks/Task');

module.exports = class extends Task {

    async run() {
        for (const { history, id } of await this.container.database.getAll('music')) {
            this.container.stores.get('gateways').music.update(id, { history: history.filter(hist => (Date.now() - hist.timestamp) <= (1000 * 60 * 60 * 24)) });
        }
    }

    async init() {
        this.run();
    }

};
