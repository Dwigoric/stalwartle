const { Cron } = require('@sapphire/time-utilities');
const { isObject } = require('@sapphire/utilities');

class ScheduledTask {

    constructor(client, taskName, time, options = {}) {
        const [_time, _recurring] = this.constructor._resolveTime(time);
        Object.defineProperty(this, 'client', { value: client });
        this.taskName = taskName;
        this.recurring = _recurring;
        this.time = 'time' in options ? new Date(options.time) : _time;
        this.id = options.id || this.constructor._generateID(this.client);
        this.catchUp = 'catchUp' in options ? options.catchUp : true;
        this.data = 'data' in options && isObject(options.data) ? options.data : {};
        this.running = false;
        this.constructor._validate(this);
    }

    get store() {
        return this.client.schedule;
    }

    get task() {
        return this.client.tasks.get(this.taskName) || null;
    }

    async run() {
        const { task } = this;
        if (!task || !task.enabled || this.running) return this;

        this.running = true;
        try {
            await task.run({ id: this.id, ...this.data });
        } catch (err) {
            this.client.emit('taskError', this, task, err);
        }
        this.running = false;

        if (!this.recurring) return this.delete();
        return this.update({ time: this.recurring });
    }

    async update({ time, data, catchUp } = {}) {
        if (time) {
            const [_time, _cron] = this.constructor._resolveTime(time);
            this.time = _time;
            this.store.tasks.splice(this.store.tasks.indexOf(this), 1);
            this.store._insert(this);
            this.recurring = _cron;
        }
        if (data) this.data = data;
        if (typeof catchUp !== 'undefined') this.catchUp = catchUp;

        const _index = this.store._tasks.findIndex(entry => entry.id === this.id);
        const newArray = this.client.settings.schedules.splice(_index, 0, this.toJSON());
        if (_index !== -1) await this.client.stores.get('gateways').get('clientGateway').update(this.client.user.id, { schedules: newArray });

        return this;
    }

    delete() {
        return this.store.delete(this.id);
    }

    toJSON() {
        return {
            id: this.id,
            taskName: this.taskName,
            time: this.time.getTime(),
            catchUp: this.catchUp,
            data: this.data,
            repeat: this.recurring ? this.recurring.cron : null
        };
    }

    static _resolveTime(time) {
        if (time instanceof Date) return [time, null];
        if (time instanceof Cron) return [time.next(), time];
        if (typeof time === 'number') return [new Date(time), null];
        if (typeof time === 'string') {
            const cron = new Cron(time);
            return [cron.next(), cron];
        }
        throw new Error('Invalid time passed');
    }

    static _generateID(client) {
        return `${Date.now().toString(36)}${client.options.shards[0].toString(36)}`;
    }

    static _validate(st) {
        if (!st.task) throw new Error('Invalid task');
        if (!st.time) throw new Error('Time or repeat option required');
        if (Number.isNaN(st.time.getTime())) throw new Error('Invalid time passed');
    }

}

module.exports = ScheduledTask;
