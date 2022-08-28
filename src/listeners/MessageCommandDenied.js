const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, {
            ...options,
            event: Events.MessageCommandDenied
        });
    }

    run(error) {
        this.container.logger.error(error);
    }

};
