const { Precondition } = require('@sapphire/framework');

module.exports = class ManagersOnlyPrecondition extends Precondition {

    async run(msg) {
        if (!msg.member) return this.ok();
        if (msg.member.permissions.has('MANAGE_GUILD')) return this.ok();
        return this.error();
    }

};
