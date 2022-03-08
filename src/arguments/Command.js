const { Argument } = require('@sapphire/framework');

module.exports = class extends Argument {

    constructor(context, options) {
        super(context, {
            ...options,
            name: 'command'
        });
    }

    run(parameter, context) {
        const command = this.container.stores.get('commands').get(parameter);
        if (command) return this.ok(command);
        return this.error({
            parameter,
            identifier: 'commandError',
            message: 'An invalid command name string was provided.',
            context
        });
    }

};
