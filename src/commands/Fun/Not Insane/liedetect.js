const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['lie', 'liedetector'],
            requiredClientPermissions: ['EMBED_LINKS'],
            options: ['force'],
            description: 'Detects a lie. Are you/they lying? Hmm...',
            detailedDescription: [
                'To detect a lie, provide a text.',
                '\nIf you want to force the results, use the `--force` flag. To use the flag, put `--force=lie` or `--force=truth`.'
            ].join('\n'),
            usage: '<Lie:string>'
        });
    }

    async messageRun(msg, args) {
        let lie = args.restResult('string');
        if (!lie.success) return send(msg, `${this.container.constants.EMOTES.xmark}  ::  \`Lie\` is a required argument.`);
        lie = lie.value;

        const gifs = {
            truth: ['https://media.giphy.com/media/5wWf7GR2nhgamhRnEuA/giphy.gif', 0x2ECC71],
            lie: ['https://media.giphy.com/media/2wVDK79pXCAsTyqLUa/giphy.gif', 0xE74C3C]
        };
        const gif = gifs[args.getOption('force')] || Object.values(gifs)[Math.round(Math.random())];

        const embed = new MessageEmbed()
            .setColor(gif[1])
            .setImage(gif[0])
            .setAuthor({ name: `${this.container.client.user.username}'s Lie Detector`, iconURL: this.container.client.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(lie)
            .setFooter({ text: `It's ${gif[1] === 0x2ECC71 ? 'the truth' : 'a lie'}!` });

        return send(msg, { embed });
    }

};
