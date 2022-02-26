const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['wiki'],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Finds a Wikipedia Article by title.',
            usage: '<Query:string>'
        });
    }

    async messageRun(msg, [query]) {
        await msg.send(`${this.container.constants.EMOTES.loading}  ::  Loading Wikipedia article...`);

        const article = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`).then(res => res.json());
        if (!article.content_urls) throw `${this.container.constants.EMOTES.xmark}  ::  I couldn't find a wikipedia article with that title.`;

        reply(msg, {
            embeds: [await new MessageEmbed()
                .setColor('RANDOM')
                .setThumbnail((article.thumbnail && article.thumbnail.source) || 'https://i.imgur.com/fnhlGh5.png')
                .setURL(article.content_urls.desktop.page)
                .setTitle(article.title)
                .setDescription(article.extract)]
        });
    }

};
