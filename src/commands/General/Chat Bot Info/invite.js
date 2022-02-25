const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Displays the join server link of the bot.'
        });
    }

    async messageRun(msg) {
        return send(msg, message);
    }

};

const message = [
    'To add Stalwartle to your Discord server:',
    '<https://bit.ly/stalwartle>',
    'You can also click my profile in the sidebar and click "Add to Server".',
    'Please use the `s.bug` command if you find any bugs.'
].join('\n');
