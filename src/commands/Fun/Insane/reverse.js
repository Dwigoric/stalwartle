const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Reverses any word/phrase you give me.',
            usage: '<StringToReverse:string>'
        });
    }

    async messageRun(msg, [string]) {
        msg.send(`↩  ::  ${string.split('').reverse().join('')}`, { disableMentions: 'everyone' });
    }

};
