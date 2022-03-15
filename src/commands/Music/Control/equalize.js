const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['DJOnly'],
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
        const player = this.container.lavacord.players.get(msg.guild.id);
        if (!player) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music playing on this server.`);

        let band = await args.pickResult('integer');
        if (!band.success) band = await args.pickResult('enum', { enum: ['setall'] });
        if (!band.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please set which band to change.`);
        band = band.value;
        if (!isNaN(band) && (band < 0 || band > 14)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  15 bands are available: \`0\` to \`14\`.`);
        let gain = await args.pickResult('number');
        if (!gain.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please set the gain of band \`${band}\`.`);
        gain = gain.value;
        if (gain < -0.25 || gain > 1.0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The value of the gain must be between \`-0.25\` and \`1.0\` inclusive.`);

        if (band === 'setall') {
            const bands = [];
            for (band of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]) bands.push({ band, gain });
            player.equalizer(bands);
            return reply(msg, [
                `${this.container.constants.EMOTES.tick}  ::  Successfully equalized all bands' gain to \`${gain}\`.`,
                gain !== 0 ? ` *Make sure you know what you're doing. Run \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}eq setall 0\` if you're unsure.*` : ''
            ].join(''));
        }
        player.equalizer([{ gain, band }]);
        return reply(msg, [
            `${this.container.constants.EMOTES.tick}  ::  Successfully equalized band \`#${band}\`'s gain to \`${gain}\`.`,
            `*Make sure you know what you're doing. Run \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}eq setall 0\` if you're unsure.*`
        ].join(' '));
    }

};
