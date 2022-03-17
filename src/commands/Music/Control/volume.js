const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            aliases: ['vol'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Changes the volume for music sessions in the server.'
        });
        this.usage = '[Volume:integer{1,300}]';
    }

    async messageRun(msg, args) {
        const volume = await args.pick('integer').catch(() => null);

        if (!volume || volume < 1 || volume > 300) return reply(msg, `🎚  ::  The volume for this server is currently set to ${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'music.volume')}%.`);
        this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, 'music.volume', volume);
        if (this.container.lavacord.players.has(msg.guild.id)) this.container.lavacord.players.get(msg.guild.id).volume(volume);

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully changed the volume for this server to ${volume}%.`);
    }

};
