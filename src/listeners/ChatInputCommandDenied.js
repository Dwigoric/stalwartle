const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, {
            ...options,
            event: Events.ChatInputCommandDenied
        });
    }

    run(error, payload) {
        if (!error.message) return;
        const message = error.message.includes('  ::  ') ? error.message : `${this.container.constants.EMOTES.xmark}  ::  ${error.message}`;
        payload.interaction.reply({ content: message, ephemeral: true, fetchReply: false });
    }

};
