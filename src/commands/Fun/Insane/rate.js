const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: "Rates anything you want from 0-10. Either 10 being the worst or the best -- it's really up to you.",
            usage: '<RateThing:string>'
        });
    }

    async messageRun(msg, [msgargs]) {
        msg.send(`I would rate ${msgargs} a **${Math.round(Math.random() * 100)}/100**!`, { disableMentions: 'everyone' });
    }

};
