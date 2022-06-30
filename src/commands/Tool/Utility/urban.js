const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

function splitText(string, length, endBy = ' ') {
    const a = string.substring(0, length).lastIndexOf(endBy);
    const pos = a === -1 ? length : a;
    return string.substring(0, pos);
}

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['ud'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Searches the Urban Dictionary library for a definition to the search term.',
            detailedDescription: 'You can use e.g. `--result=2` to get the second result for the word.',
            options: ['result']
        });
        this.usage = '<SearchTerm:string>';
    }

    async messageRun(msg, args) {
        let search = await args.restResult('string');
        if (!search.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the term to search in the Urban Dictionary.`);
        search = search.value;
        const index = parseInt(args.getOption('result')) || 1;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading Urban definition...`);

        const params = new URLSearchParams();
        params.set('term', search);
        const body = await fetch(`http://api.urbandictionary.com/v0/define?${params}`).then(res => res.json());

        const result = body.list[index - 1];
        if (!result) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  No Urban Dictionary entry found.`);

        const definition = result.definition.length > 1000 ?
            `${splitText(result.definition, 1000)}...` :
            result.definition;

        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`'${result.word}' as defined by ${result.author}`)
                .setURL(result.permalink)
                .setDescription(definition)
                .addField('Example', result.example.split('\n')[0] || 'No example available.')
                .addField('Rating', `**${result.thumbs_up}** 👍 | **${result.thumbs_down}** 👎`)
                .setFooter({ text: 'Definition from Urban Dictionary' })
                .setTimestamp()]
        });
    }

};
