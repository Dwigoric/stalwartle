const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: ['text'],
            description: 'Seeks the current song to the specified time.',
            extendedHelp: 'To use this command use e.g. `22m 29s` or `1h 24m 42s`',
            usage: '<SeekTime:time>'
        });
    }

    async run(msg, [seek]) {
        seek -= Date.now();
        const { queue } = await this.container.client.providers.default.get('music', msg.guild.id);
        if (!queue.length || !msg.guild.me.voice.channel) throw `${this.container.client.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${msg.guild.settings.get('prefix')}play\``; // eslint-disable-line max-len
        if (!queue[0].info.isSeekable) throw `${this.container.client.constants.EMOTES.xmark}  ::  The current track playing cannot be seeked.`;
        if (queue[0].info.length < seek) throw `${this.container.client.constants.EMOTES.xmark}  ::  The time you supplied is longer than the song's length.`;
        this.container.client.lavacord.players.get(msg.guild.id).seek(seek);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully seeked the music.`);
    }

};
