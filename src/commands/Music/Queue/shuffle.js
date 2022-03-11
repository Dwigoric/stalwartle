const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Shuffles the server music queue.'
        });
    }

    async messageRun(msg) {
        const { queue } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!queue.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the queue. Add one with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\`.`);
        const upNext = queue.slice(1);
        if (!upNext.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no up-next songs... I have nothing to shuffle!`);

        this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, {
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

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully shuffled the queue. Check it out with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}queue\`.`);
    }

};
