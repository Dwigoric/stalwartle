const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Reverses any word/phrase you give me.'
        });
    }

    async messageRun(msg, args) {
        const string = args.restResult('string');
        if (!string.success) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide me what to reverse.`);

        return send(msg, `↩  ::  ${string.value.split('').reverse().join('')}`, { disableMentions: 'everyone' });
    }

};
