const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['lie', 'liedetector'],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Detects a lie. Are you/they lying? Hmm...',
            extendedHelp: [
                'To detect a lie, provide a text.',
                '\nIf you want to force the results, use the `--force` flag. To use the flag, put `--force=lie` or `--force=truth`.'
            ].join('\n'),
            usage: '<Lie:string>'
        });
    }

    async run(msg, [lie]) {
        const gifs = {
            truth: ['https://media.giphy.com/media/5wWf7GR2nhgamhRnEuA/giphy.gif', 0x2ECC71],
            lie: ['https://media.giphy.com/media/2wVDK79pXCAsTyqLUa/giphy.gif', 0xE74C3C]
        };
        const gif = msg.flagArgs.force && ['truth', 'lie'].includes(msg.flagArgs.force) ? gifs[msg.flagArgs.force] : Object.values(gifs)[Math.round(Math.random())];

        const embed = new MessageEmbed()
            .setColor(gif[1])
            .setImage(gif[0])
            .setAuthor(`${this.client.user.username}'s Lie Detector`, this.client.user.displayAvatarURL({ dynamic: true }))
            .setDescription(lie)
            .setFooter(`It's ${gif[1] === 0x2ECC71 ? 'the truth' : 'a lie'}!`);

        msg.send(embed);
    }

};
