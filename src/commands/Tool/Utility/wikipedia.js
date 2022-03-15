const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['wiki'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Finds a Wikipedia Article by title.'
        });
        this.usage = '<Query:string>';
    }

    async messageRun(msg, args) {
        let query = await args.restResult('string');
        if (!query.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the title of the Wikipedia article you want to search.`);
        query = query.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading Wikipedia article...`);

        const article = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`).then(res => res.json());
        if (!article.content_urls) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I couldn't find a wikipedia article with that title.`);

        return reply(msg, {
            embeds: [await new MessageEmbed()
                .setColor('RANDOM')
                .setThumbnail((article.thumbnail && article.thumbnail.source) || 'https://i.imgur.com/fnhlGh5.png')
                .setURL(article.content_urls.desktop.page)
                .setTitle(article.title)
                .setDescription(article.extract)]
        });
    }

};
