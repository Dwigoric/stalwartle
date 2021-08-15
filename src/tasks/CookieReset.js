const Task = require('../lib/structures/tasks/Task');

module.exports = class extends Task {

    async run() { return true; }

};
