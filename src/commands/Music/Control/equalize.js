const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly', 'MusicControl'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            aliases: ['eq'],
            description: 'Equalizes the song player using bands and gains.',
            detailedDescription: [
                'There are 15 bands (`0` to `14`) that can be changed.',
                '**Gain** is the multiplier for the given band. The default value of gain each band is `0`.',
                'Valid values range from `-0.25` to `1.0`, where `-0.25` means the given band is completely muted, and `0.25` means it is doubled.',
                '\nModifying the gain could also change the volume of the output.',
                '\nTo set gain for all bands, replace the `band` with `setall`, e.g. `s.eq setall 0`.'
            ].join('\n')
        });
        this.usage = '<setall|Band:integer{0,14}> <Gain:number{-0.25,1.0}>';
    }

    async messageRun(msg, args) {
        const player = this.container.erela.players.get(msg.guild.id);
        if (!player) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music playing on this server.`);

        const band = await args.pick('integer').catch(() => args.pick('enum', { enum: ['setall'] }).catch(() => null));
        if (band === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please set which band to change.`);
        if (!isNaN(band) && (band < 0 || band > 14)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  15 bands are available: \`0\` to \`14\`.`);
        const gain = await args.pick('number').catch(() => null);
        if (gain === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please set the gain of band \`${band}\`.`);
        if (gain < -0.25 || gain > 1.0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The value of the gain must be between \`-0.25\` and \`1.0\` inclusive.`);

        if (band === 'setall') {
            const bands = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(bandNum => ({ band: bandNum, gain }));
            player.setEQ(bands);
            return reply(msg, [
                `${this.container.constants.EMOTES.tick}  ::  Successfully equalized all bands' gain to \`${gain}\`.`,
                gain !== 0 ? ` *Make sure you know what you're doing. Run \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}eq setall 0\` if you're unsure.*` : ''
            ].join(''));
        }
        player.setEQ([{ gain, band }]);
        return reply(msg, [
            `${this.container.constants.EMOTES.tick}  ::  Successfully equalized band \`#${band}\`'s gain to \`${gain}\`.`,
            `*Make sure you know what you're doing. Run \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}eq setall 0\` if you're unsure.*`
        ].join(' '));
    }

};
