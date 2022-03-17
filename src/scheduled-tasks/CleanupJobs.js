const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');

module.exports = class JobSweeper extends ScheduledTask {

    constructor(context, options) {
        super(context, {
            ...options,
            cron: '* * * * *'
        });
    }

    async run() {
        const tasks = await this.container.tasks.list({}).then(jobs => jobs.filter(job => job.processedOn));
        tasks.forEach(task => this.container.tasks.delete(task.id));
    }

};
