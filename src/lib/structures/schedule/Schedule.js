const ScheduledTask = require('./ScheduledTask');

class Schedule {

    constructor(client) {
        this.client = client;
        this.tasks = [];
        this._interval = null;
    }

    get _tasks() {
        return this.client.settings.schedules;
    }

    async init() {
        const tasks = this._tasks;
        if (!tasks || !Array.isArray(tasks)) return;

        for (const task of tasks) {
            try {
                await this._add(task.taskName, task.repeat || task.time, task);
            } catch (error) {
                this.client.emit('warn', `Task ${task.taskName} [${task.id}] was not queued: ${error}`);
            }
        }

        this._checkInterval();
    }

    async execute() {
        if (!this.client.ready) return;
        if (this.tasks.length) {
            const now = Date.now();
            const execute = [];
            for (const task of this.tasks) {
                if (task.time.getTime() > now) break;
                execute.push(task.run());
            }

            if (!execute.length) return;
            await Promise.all(execute);
        }
        this._checkInterval();
    }

    get(id) {
        return this.tasks.find(entry => entry.id === id);
    }

    next() {
        return this.tasks[0];
    }

    async create(taskName, time, options) {
        const task = await this._add(taskName, time, options);
        if (!task) return null;
        const { schedules } = this.client.settings;
        schedules.push(task);
        await this.client.gateways.client.update(this.client.user.id, { schedules });
        return task;
    }

    async delete(id) {
        const taskIndex = this.tasks.findIndex(entry => entry.id === id);
        if (taskIndex === -1) throw new Error('This task does not exist');

        this.tasks.splice(taskIndex, 1);
        const task = this._tasks.findIndex(entry => entry.id === id);
        const { schedules } = this.client.settings;
        schedules.splice(task, 1);
        if (task) await this.client.gateways.client.update(this.client.user.id, { schedules });

        return this;
    }

    async clear() {
        this.client.gateways.client.update(this.client.user.id, { schedules: this.client.gateways.client.defaults.schedules });
        this.tasks = [];
    }

    async _add(taskName, time, options) {
        const task = new ScheduledTask(this.client, taskName, time, options);

        if (!task.catchUp && task.time < Date.now()) {
            if (!task.recurring) {
                await task.delete();
                return null;
            }
            await task.update({ time: task.recurring });
        }
        this._insert(task);
        this._checkInterval();
        return task;
    }

    _insert(task) {
        const index = this.tasks.findIndex(entry => entry.time > task.time);
        if (index === -1) this.tasks.push(task);
        else this.tasks.splice(index, 0, task);
        return task;
    }

    _clearInterval() {
        this.client.clearInterval(this._interval);
        this._interval = null;
    }

    _checkInterval() {
        if (!this.tasks.length) this._clearInterval();
        else if (!this._interval) this._interval = this.client.setInterval(this.execute.bind(this), this.client.options.schedule.interval);
    }

    *[Symbol.iterator]() {
        yield* this.tasks;
    }

}

module.exports = Schedule;
