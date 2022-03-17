const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    constructor(context, options) {
        super(context, {
            ...options,
            position: 0
        });
    }

    run() {
        if (this.container.client.user.presence.status === 'online') return this.ok();
        return this.error();
    }

};
