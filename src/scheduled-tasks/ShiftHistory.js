const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');

module.exports = class ShiftHistoryTask extends ScheduledTask {

    constructor(context, options) {
        super(context, {
            ...options,
            cron: '*/5 * * * *'
        });
    }

    async run() {
        for (const { history, id } of await this.container.database.getAll('music')) {
            if (!history) continue;
            this.container.stores.get('gateways').get('musicGateway').update(id, { history: history.filter(hist => (Date.now() - hist.timestamp) <= (1000 * 60 * 60 * 24)) });
        }
    }

    async init() {
        this.run();
    }

};
