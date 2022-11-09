const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Util: { escapeMarkdown, splitMessage } } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['ly'],
            description: 'Searches song lyrics using your search query.'
        });
        this.usage = '<Query:string>';
        this.NO_LYRICS_FOUND = `${this.container.constants.EMOTES.xmark}  ::  No song lyrics found.`;
    }

    async messageRun(msg, args) {
        const query = await args.rest('string').then(str => str.trim()).catch(() => null);
        if (query === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide your lyric query.`);

        const message = await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading lyrics...`);

        const params = new URLSearchParams();
        params.set('title', query);
        const metadata = await fetch(`https://some-random-api.ml/lyrics?${params}`).then(res => res.json());
        if (metadata.error) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  ${metadata.error}`);
        const lyrics = metadata.lyrics.split('\n');
        while (lyrics.indexOf('') >= 0) lyrics.splice(lyrics.indexOf(''), 1, '\u200b');

        const fullLyrics = [
            [
                `__***${metadata.title}***__`,
                `*by **${metadata.author}***\n`
            ].join('\n'),
            escapeMarkdown(lyrics.join('\n'))
        ].join('\n');

        const swearArray = (msg.guild ? this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'automod.swearWords').map(word => `(?:^|\\W)${word}(?:$|\\W)`) : [])
            .concat(this.container.constants.SWEAR_WORDS_REGEX)
            .map(word => `(?:^|\\W)${word}(?:$|\\W)`);
        const swearRegex = new RegExp(swearArray.join('|'), 'im');
        if (swearRegex.test(fullLyrics) && msg.guild && !msg.channel.nsfw) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The song contains NSFW lyrics and this channel is not marked as NSFW.`);

        await Promise.all(splitMessage(fullLyrics, { char: '\u200b' }).map(lyricPart => msg.channel.send(lyricPart))).catch(() => splitMessage(fullLyrics).map(lyricPart => msg.channel.send(lyricPart)));
        return message.delete();
    }

};
