const { Precondition } = require('@sapphire/framework');

module.exports = class DevsOnlyPrecondition extends Precondition {

    async run(msg) {
        if (this.container.client.options.developers.includes(msg.author.id)) return this.ok();
        return this.error();
    }

};
