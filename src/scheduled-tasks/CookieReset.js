const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');

module.exports = class extends ScheduledTask {

    // skipcq: JS-0105
    async run() { return true; }

};
