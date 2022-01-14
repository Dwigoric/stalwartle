const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: ['text'],
            description: 'Shuffles the server music queue.'
        });
    }

    async messageRun(msg) {
        const { queue = [] } = await this.container.client.providers.default.get('music', msg.guild.id) || {};
        const upNext = queue.slice(1);
        if (!queue.length) throw `${this.container.client.constants.EMOTES.xmark}  ::  There are no songs in the queue. Add one with \`${msg.guild.settings.get('prefix')}play\``;
        if (!upNext.length) throw `${this.container.client.constants.EMOTES.xmark}  ::  There are no up-next songs... I have nothing to shuffle!`;
        this.container.client.providers.default.update('music', msg.guild.id, {
            queue: [queue[0]].concat((() => {
                for (let current = upNext.length - 1; current > 0; current--) {
                    const random = Math.floor(Math.random() * (current + 1));
                    const temp = upNext[current];
                    upNext[current] = upNext[random];
                    upNext[random] = temp;
                }
                return upNext;
            })())
        });
        msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully shuffled the queue. Check it out with \`${msg.guild.settings.get('prefix')}queue\`.`);
    }

};
