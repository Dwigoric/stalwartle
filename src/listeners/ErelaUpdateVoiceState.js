const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, {
            ...options,
            event: Events.Raw
        });
    }

    run(data) {
        if (this.container.erela) this.container.erela.updateVoiceState(data);
    }

};
