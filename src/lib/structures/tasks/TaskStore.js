const { AliasStore } = require('@sapphire/pieces');

class TaskStore extends AliasStore {

    constructor(Task) {
        super(Task, { name: 'tasks' });
    }

}

module.exports = TaskStore;
