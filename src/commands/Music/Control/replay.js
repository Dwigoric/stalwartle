const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: ['text'],
            description: 'Replays the current playing song.'
        });
    }

    async run(msg) {
        // eslint-disable-next-line max-len
        if (!this.container.client.lavacord.players.get(msg.guild.id) || !this.container.client.lavacord.players.get(msg.guild.id).playing) throw `${this.container.client.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${msg.guild.settings.get('prefix')}play\``;
        const song = await this.container.client.providers.default.get('music', msg.guild.id).then(ms => ms.queue[0]);
        if (!song.info.isSeekable) throw `${this.container.client.constants.EMOTES.xmark}  ::  The current track playing cannot be replayed.`;
        this.container.client.lavacord.players.get(msg.guild.id).seek(0);
        this.container.client.lavacord.players.get(msg.guild.id).pause(false);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully replayed the music.`);
    }

};
