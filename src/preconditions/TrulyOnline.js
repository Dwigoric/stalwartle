const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 0
        });
    }

    chatInputRun() {
        return this.runForAll();
    }

    messageRun() {
        return this.runForAll();
    }

    runForAll() {
        if (this.container.client.user.presence.status === 'online') return this.ok();
        return this.error();
    }

};
