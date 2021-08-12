const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: ['text'],
            aliases: ['eq'],
            description: 'Equalizes the song player using bands and gains.',
            extendedHelp: [
                'There are 15 bands (`0` to `14`) that can be changed.',
                '**Gain** is the multiplier for the given band. The default value of gain each band is `0`.',
                'Valid values range from `-0.25` to `1.0`, where `-0.25` means the given band is completely muted, and `0.25` means it is doubled.',
                '\nModifying the gain could also change the volume of the output.',
                '\nTo set gain for all bands, replace the `band` with `setall`, e.g. `s.eq setall 0`.'
            ].join('\n'),
            usage: '<setall|Band:integer{0,14}> <Gain:number{-0.25,1.0}>',
            usageDelim: ' '
        });
    }

    async run(msg, [band, gain]) {
        if (band === 'setall') {
            const bands = [];
            for (band of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]) bands.push({ band, gain });
            this.client.lavacord.players.get(msg.guild.id).equalizer(bands);
            return msg.send([
                `${this.client.constants.EMOTES.tick}  ::  Successfully equalized all bands' gain to \`${gain}\`.`,
                gain !== 0 ? ` *Make sure you know what you're doing. Run \`${msg.guild.settings.get('prefix')}eq setall 0\` if you're unsure.*` : ''
            ].join(''));
        }
        this.client.lavacord.players.get(msg.guild.id).equalizer([{ gain, band }]);
        return msg.send([
            `${this.client.constants.EMOTES.tick}  ::  Successfully equalized band \`#${band}\`'s gain to \`${gain}\`.`,
            `*Make sure you know what you're doing. Run \`${msg.guild.settings.get('prefix')}eq setall 0\` if you're unsure.*`
        ].join(' '));
    }

};
