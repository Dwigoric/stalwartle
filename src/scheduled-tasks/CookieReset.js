const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');

module.exports = class extends ScheduledTask {

    // skipqc: JS-0105
    async run() { return true; }

};
