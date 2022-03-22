const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Pauses music playing in the voice channel.'
        });
    }

    async messageRun(msg) {
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music playing in this server!`);
        if (player.paused) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Music is already paused! Resume it with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}resume\`.`); // eslint-disable-line max-len

        player.pause(true);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully paused the music for this server.`);
    }

};
