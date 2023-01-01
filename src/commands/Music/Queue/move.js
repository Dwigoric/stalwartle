const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;
const { Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Moves a queue entry to a specified position in the queue.',
            detailedDescription: 'If you want to move e.g. entry #3 to position #7, do `s.move 3 7`'
        });
        this.usage = '<QueueEntry:integer{1}> <NewPosition:integer{1}>';
    }

    async messageRun(msg, args) {
        const entry = await args.pick('integer').catch(() => null);
        if (entry === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give me which queue entry you want to move.`);
        if (entry < 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid value.`);
        const position = await args.pick('integer').catch(() => null);
        if (position === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give me to which position you want to move the entry to.`);
        if (position < 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid value.`);
        if (entry === position) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  What's the point of moving a queue entry to the same position?`);

        const player = this.container.erela.players.get(msg.guild.id);
        const { queue } = player && player.playing ? player : await this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (queue.length <= (player && player.playing ? 1 : 2)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no queue entry to move.`);
        // eslint-disable-next-line max-len
        if (entry > (queue.length - (player && player.playing ? 0 : 1)) || position > (queue.length - (player && player.playing ? 0 : 1))) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server queue only has ${queue.length - (player && player.playing ? 0 : 1)} entr${queue.length - (player && player.playing ? 0 : 1) === 1 ? 'y' : 'ies'}.`);
        queue.splice(position - (player && player.playing ? 1 : 0), 0, ...queue.splice(entry - (player && player.playing ? 1 : 0), 1));

        const newQueue = Array.from(queue);
        if (player && player.playing) newQueue.unshift(player.queue.current);
        await this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { queue: newQueue });
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully moved **${escapeMarkdown(queue[position - (player && player.playing ? 1 : 0)].title)}** to position \`#${position}\`. New queue at \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}queue\`.`); // eslint-disable-line max-len
    }

};
