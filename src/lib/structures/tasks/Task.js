const { AliasPiece } = require('@sapphire/pieces');

class Task extends AliasPiece {

    constructor(context, options) {
        super(context, { ...options, name: (options.name || context.name).toLowerCase() });
    }

    async run() {
        throw new Error(`The run method has not been implemented by Task ${this.name}`);
    }

}

module.exports = Task;
