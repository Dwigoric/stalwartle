const { Command, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: "Rates anything you want from 0-10. Either 10 being the worst or the best -- it's really up to you."
        });
        this.usage = '<RateThing:string>';
    }

    async messageRun(msg, args) {
        const ratething = await args.restResult('string');
        if (!ratething.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide what you want to rate.`);

        return reply(msg, `I would rate ${ratething.value} a **${Math.round(Math.random() * 100)}/100**!`, { disableMentions: 'everyone' });
    }

};
