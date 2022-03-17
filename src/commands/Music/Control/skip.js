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
        if (!msg.guild.me.voice.channel) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music playing in this server!`);

        const entry = await args.pick('integer').catch(() => null);

        const isDJ = await this.container.stores.get('preconditions').get('DJOnly').run(msg).then(res => res.success);
        if (entry && isDJ) return this.#skipToEntry(msg, entry);
        if (args.getFlags('force') && isDJ) {
            this.container.cache.guilds.get(msg.guild.id).clearVoteskips();
            this.container.lavacord.players.get(msg.guild.id).stop();
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
        this.container.lavacord.players.get(msg.guild.id).stop();

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully skipped the music for this server.`);
    }

    async #skipToEntry(msg, entry) {
        const { queue } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (queue.length < 2) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no queue entry to skip to.`);
        if (entry > queue.length - 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The server queue only has ${queue.length - 1} entr${queue.length - 1 === 1 ? 'y' : 'ies'}.`);

        queue.splice(1, 0, queue.splice(entry, 1)[0]);
        await this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { queue });

        this.container.cache.guilds.get(msg.guild.id).clearVoteskips();
        this.container.lavacord.players.get(msg.guild.id).stop();

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully skipped to entry \`#${entry}\`.`);
    }

};
