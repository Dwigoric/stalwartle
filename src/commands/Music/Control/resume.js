const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Resumes paused music in the server.'
        });
    }

    async messageRun(msg) {
        if (!msg.guild.me.voice.channel) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music playing in this server!`);
        if (!this.container.erela.get(msg.guild.id).paused) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Music is already playing! Pause it with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}pause\`.`); // eslint-disable-line max-len

        this.container.erela.get(msg.guild.id).pause(false);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully resumed the music for this server.`);
    }

};
