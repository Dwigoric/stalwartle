const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: "Rates anything you want from 0-10. Either 10 being the worst or the best -- it's really up to you."
        });
    }

    async messageRun(msg, args) {
        const ratething = args.restResult('string');
        if (!ratething.success) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide what you want to rate.`);

        return send(msg, `I would rate ${ratething.value} a **${Math.round(Math.random() * 100)}/100**!`, { disableMentions: 'everyone' });
    }

};
