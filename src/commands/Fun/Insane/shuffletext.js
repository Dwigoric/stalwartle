const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['jumble'],
            description: 'Shuffles any word or phrase you give.'
        });
    }

    async messageRun(msg, args) {
        const string = args.restResult('string');
        if (!string.success) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide me what to shuffle.`);

        return send(msg, `🔀  ::  ${shuffle(string.value)}`, { disableMentions: 'everyone' });
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
