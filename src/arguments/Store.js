const { Argument } = require('@sapphire/framework');

module.exports = class extends Argument {

    constructor(context, options) {
        super(context, {
            ...options,
            name: 'store'
        });
    }

    run(parameter, context) {
        const store = this.container.stores.get(parameter);
        if (store) return this.ok(store);
        return this.error({
            parameter,
            context,
            identifier: 'InvalidStore',
            message: 'An invalid store name was provided.'
        });
    }

};
