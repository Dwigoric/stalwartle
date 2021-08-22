const { Precondition } = require('@sapphire/framework');

module.exports = class AdminsOnlyPrecondition extends Precondition {

    async run(msg) {
        if (!msg.member) return this.ok();
        if (msg.member.permissions.has('ADMINISTRATOR')) return this.ok();
        return this.error();
    }

};
