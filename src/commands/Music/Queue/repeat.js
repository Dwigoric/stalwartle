const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['loop'],
            preconditions: ['DJOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Sets if the current song will be repeated or the whole queue.',
            detailedDescription: 'Supply `song` if you want to repeat the song, or `queue` if you want the queue to repeat.'
        });
        this.usage = '[song|queue|none]';
        this.symbols = {
            song: '🔂',
            queue: '🔁',
            none: '➡'
        };
    }

    async messageRun(msg, args) {
        const repeat = await args.pick('enum', { enum: ['song', 'queue', 'none'] }).catch(() => null);

        const { music, prefix } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        if (!repeat) {
            return reply(msg, [
                `${this.symbols[music.repeat]}  ::  Music sessions in this server are set to repeat ${music.repeat === 'none' ?
                    'nothing' :
                    `the ${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'music.repeat')}`}.`,
                `Run \`${prefix}help repeat\` to get more information on changing music loops.`
            ].join(' '));
        }
        await this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, { music: { repeat } });

        const player = this.container.erela.players.get(msg.guild.id);
        if (player) {
            switch (repeat) {
                case 'queue': player.setQueueRepeat(true); break;
                case 'song': player.setTrackRepeat(true); break;
                default:
                    player.setQueueRepeat(false);
                    player.setTrackRepeat(false);
            }
        }

        return reply(msg, `${this.symbols[repeat]}  ::  Music sessions in this server are now set to repeat ${repeat === 'none' ? 'nothing' : `the ${repeat}`}.`);
    }

};
