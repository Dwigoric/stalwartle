const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Skips current song playing in the voice channel.',
            detailedDescription: [
                'If you want to force skip, just use the `--force` flag. Usable only by DJs and moderators.',
                'To skip to a specific entry in the queue, just do `s.skip <entry number>`. Also usable only by DJs and moderators.'
            ].join('\n'),
            flags: ['force']
        });
        this.usage = '[QueueEntry:integer]';
    }

    async messageRun(msg, args) {
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player || !player.playing) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music playing in this server!`);

        const entry = await args.pick('integer').catch(() => null);

        const isDJ = await this.container.stores.get('preconditions').get('DJOnly').run(msg).then(res => res.success);
        if (entry && isDJ) return this.#skipToEntry(msg, entry);
        if (args.getFlags('force') && isDJ) {
            this.container.cache.guilds.get(msg.guild.id).clearVoteskips();
            this.container.erela.players.get(msg.guild.id).stop();
            return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully forcibly skipped the music for this server.`);
        }

        if (this.container.cache.guilds.get(msg.guild.id).voteskips.includes(msg.author.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You've already voted to skip the current song.`);
        const { members } = msg.guild.me.voice.channel;
        if (!members.has(msg.author.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You are not connected to the voice channel I'm playing on.`);

        this.container.cache.guilds.get(msg.guild.id).addVoteskip(msg.author.id, members);
        const requiredVotes = members.filter(mb => !mb.user.bot).size / 2;
        if (this.container.cache.guilds.get(msg.guild.id).voteskips.length <= requiredVotes) {
            return reply(msg, [
                `${this.container.constants.EMOTES.tick}  ::  Successfully added your vote to skip the current song!`,
                `Current votes: \`${this.container.cache.guilds.get(msg.guild.id).voteskips.length}\`.`,
                `Required votes: \`${Math.floor(requiredVotes + 1)}\` (more than 50% of current listeners). Bots are not counted.`,
                `To forcibly skip the song, use \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}skip --force\`.`
            ].join('\n'));
        }

        this.container.cache.guilds.get(msg.guild.id).clearVoteskips();
        player.stop();

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully skipped the music for this server.`);
    }

    async #skipToEntry(msg, entry) {
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player.queue.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no queue entry to skip to.`);
        if (entry > player.queue.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server queue only has ${player.queue.length} entr${player.queue.length === 1 ? 'y' : 'ies'}.`);

        player.queue.splice(0, 0, ...player.queue.splice(entry - 1, 1));

        const newQueue = Array.from(player.queue);
        newQueue.unshift(player.queue.current);
        await this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { queue: newQueue });

        this.container.cache.guilds.get(msg.guild.id).clearVoteskips();
        player.stop();

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully skipped to entry \`#${entry}\`.`);
    }

};
