const { Command, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, { ...options, description: 'Toggle whether your AFK status will be removed either when you talk or when you run the `s.afk` command.' });
    }

    async messageRun(msg) {
        const afkSet = container.stores.get('gateways').get('userGateway').get(msg.author.id, 'afktoggle') ? ['talk', false] : [`run the \`s.afk\` command`, true];
        reply(msg, `${this.container.constants.EMOTES.tick}  ::  Your AFK status will now be removed **when you ${afkSet[0]}**.`);
        container.stores.get('gateways').get('userGateway').update(msg.author.id, 'afktoggle', afkSet[1]);
    }

};
