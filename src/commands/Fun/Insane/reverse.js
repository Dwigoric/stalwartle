const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Reverses any word/phrase you give me.'
        });
    }

    async messageRun(msg, args) {
        const string = await args.restResult('string');
        if (!string.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide me what to reverse.`);

        return reply(msg, `↩  ::  ${string.value.split('').reverse().join('')}`, { disableMentions: 'everyone' });
    }

};
