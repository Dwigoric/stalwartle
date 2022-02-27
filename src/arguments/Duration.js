const { Argument } = require('@sapphire/framework');
const { Duration } = require('@sapphire/time-utilities');

module.exports = class extends Argument {

    constructor(context, options) {
        super(context, {
            ...options,
            name: 'duration'
        });
    }

    run(parameter, context) {
        const date = new Duration(parameter).fromNow;
        if (!isNaN(date.getTime()) && date.getTime() > Date.now()) return this.ok(date);
        return this.error({
            parameter,
            identifier: 'durationError',
            message: 'An invalid duration string was provided.',
            context
        });
    }

};
