const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Forwards the current song by the specified time.',
            detailedDescription: 'To use this command use e.g. `22m 29s` to forward the song by 22 minutes and 29 seconds.'
        });
    }

    async messageRun(msg, args) {
        let seek = await args.pickResult('duration');
        if (!seek.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  How far into the track should I forward the song to?`);
        seek = seek.value;

        seek -= Date.now();

        const song = ((await this.container.databases.default.get('music', msg.guild.id) || {}).queue || [])[0];
        if (!msg.guild.me.voice.channel) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  No song playing! Add one using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\``);
        if (!song.info.isSeekable) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The current track playing cannot be forwarded.`);

        const player = this.container.lavacord.players.get(msg.guild.id);
        player.seek(player.state.position + seek);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully forwarded the music.`);
    }

};
