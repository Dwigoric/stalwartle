const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['jumble'],
            description: 'Shuffles any word or phrase you give.'
        });
        this.usage = '<PhraseToShuffle:string>';
    }

    async messageRun(msg, args) {
        const string = await args.restResult('string');
        if (!string.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide me what to shuffle.`);

        return reply(msg, `🔀  ::  ${shuffle(string.value)}`, { disableMentions: 'everyone' });
    }

};

const shuffle = (str) => {
    const a = str.split('');

    for (let i = 0; i < a.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }

    return a.join('');
};
