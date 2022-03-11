const { Listener, Events } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class PreconditionMessage extends Listener {

    constructor(context, options) {
        super(context, {
            ...options,
            event: Events.CommandDenied
        });
    }

    async run(error, payload) {
        const message = error.message.includes('  ::  ') ? error : `${this.container.constants.EMOTES.xmark}  ::  ${error.message}`;
        reply(payload.message, message);
    }

};
