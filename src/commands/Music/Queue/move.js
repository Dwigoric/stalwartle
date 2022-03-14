const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Moves a queue entry to a specified position in the queue.',
            detailedDescription: 'If you want to move e.g. entry #3 to position #7, do `s.move 3 7`'
        });
    }

    async messageRun(msg, args) {
        let entry = await args.pickResult('integer');
        if (!entry.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give me which queue entry you want to move.`);
        entry = entry.value;
        let position = await args.pickResult('integer');
        if (!position.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give me to which position you want to move the entry to.`);
        position = position.value;

        const { queue } = await this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (queue.length <= 2) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no queue entry to move.`);
        // eslint-disable-next-line max-len
        if (entry > queue.length - 1 || position > queue.length - 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server queue only has ${queue.length - 1} entr${queue.length - 1 === 1 ? 'y' : 'ies'}.`);
        if (entry === position) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  What's the point of moving a queue entry to the same position?`);
        queue.splice(position, 0, queue.splice(entry, 1)[0]);
        await this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { queue });
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully moved **${escapeMarkdown(queue[position].info.title)}** to position \`#${position}\`. New queue at \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}queue\`.`); // eslint-disable-line max-len
    }

};
