const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, { description: 'Toggle whether your AFK status will be removed either when you talk or when you run the `s.afk` command.' });
    }

    async messageRun(msg) {
        const afkSet = msg.author.settings.get('afktoggle') ? ['talk', false] : [`run the \`s.afk\` command`, true];
        msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Your AFK status will now be removed **when you ${afkSet[0]}**.`);
        msg.author.settings.update('afktoggle', afkSet[1]);
    }

};
