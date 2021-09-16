const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            description: 'Skips current song playing in the voice channel.',
            extendedHelp: [
                'If you want to force skip, just use the `--force` flag. Usable only by DJs and moderators.',
                'To skip to a specific entry in the queue, just do `s.skip <entry number>`. Also usable only by DJs and moderators.'
            ],
            usage: '[QueueEntry:integer]'
        });
    }

    async run(msg, [entry]) {
        if (!msg.guild.me.voice.channel) throw `${this.container.client.constants.EMOTES.xmark}  ::  There is no music playing in this server!`;
        if (entry && await msg.hasAtLeastPermissionLevel(5)) return this.skipToEntry(msg, entry);
        if (msg.flagArgs.force && await msg.hasAtLeastPermissionLevel(5)) {
            msg.guild.clearVoteskips();
            this.container.client.lavacord.players.get(msg.guild.id).stop();
            return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully forcibly skipped the music for this server.`);
        }
        if (this.container.client.cache.guilds.get(msg.guild.id).voteskips.includes(msg.author.id)) throw `${this.container.client.constants.EMOTES.xmark}  ::  You've already voted to skip the current song.`;
        const { members } = msg.guild.me.voice.channel;
        if (!members.has(msg.author.id)) throw `${this.container.client.constants.EMOTES.xmark}  ::  You are not connected to the voice channel I'm playing on.`;
        msg.guild.addVoteskip(msg.author.id, members);
        const requiredVotes = members.filter(mb => !mb.user.bot).size / 2;
        if (this.container.client.cache.guilds.get(msg.guild.id).voteskips.length <= requiredVotes) {
            return msg.send([
                `${this.container.client.constants.EMOTES.tick}  ::  Successfully added your vote to skip the current song!`,
                `Current votes: \`${this.container.client.cache.guilds.get(msg.guild.id).voteskips.length}\`.`,
                `Required votes: \`${Math.floor(requiredVotes + 1)}\` (more than 50% of current listeners). Bots are not counted.`,
                `To forcibly skip the song, use \`${msg.guild.settings.get('prefix')}skip --force\`.`
            ]);
        }
        msg.guild.clearVoteskips();
        this.container.client.lavacord.players.get(msg.guild.id).stop();
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully skipped the music for this server.`);
    }

    async skipToEntry(msg, entry) {
        const { queue = [] } = await this.container.client.providers.default.get('music', msg.guild.id) || {};
        if (queue.length < 2) throw `${this.container.client.constants.EMOTES.xmark}  ::  There is no queue entry to skip to.`;
        if (entry > queue.length - 1) throw `${this.container.client.constants.EMOTES.xmark}  ::  The server queue only has ${queue.length - 1} entr${queue.length - 1 === 1 ? 'y' : 'ies'}.`;
        queue.splice(1, 0, queue.splice(entry, 1)[0]);
        await this.container.client.providers.default.update('music', msg.guild.id, { queue });
        msg.guild.clearVoteskips();
        msg.guild.player.stop();
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully skipped to entry \`#${entry}\`.`);
    }

};
