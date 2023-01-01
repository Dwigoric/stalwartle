const { Listener, Events, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class PreconditionMessage extends Listener {

    constructor(context, options) {
        super(context, {
            ...options,
            event: Events.CommandDenied
        });
    }

    async run(error, payload) {
        if (!error.message) return;
        const message = error.message.includes('  ::  ') ? error.message : `${this.container.constants.EMOTES.xmark}  ::  ${error.message}`;
        reply(payload.message, message);
    }

};
