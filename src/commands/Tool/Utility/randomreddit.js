const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Returns a random reddit post on a given subreddit.'
        });
    }

    async messageRun(msg, args) {
        let subreddit = await args.restResult('string');
        if (!subreddit.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the subreddit you want to get a random post from.`);
        subreddit = subreddit.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading reddit post...`);
        const { data } = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`)
            .then(res => res.json())
            .then(res => {
                if (res.error) return { data: null };
                return res[0].data.children[0];
            })
            .catch(() => ({ data: null }));

        if (data === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There was an error. Reddit may be down, or the subreddit doesn't exist.`);

        if (data.over_18 && !msg.channel.nsfw) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The post contains NSFW content and this channel is not marked as NSFW.`);

        if (Boolean(msg.guild) && !msg.channel.permissionsFor(this.container.client.user).has('EMBED_LINKS')) return reply(msg, `***${data.title}***\n\n${data.url}`);

        const trim = (str, max) => str.length > max ? `${str.slice(0, max)}...` : str;
        return reply(msg, { embeds: [new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor({ name: trim(data.title, 253), url: `https://www.reddit.com${data.permalink}` })
            .setTitle(`u/${data.author}`)
            .setURL(`https://www.reddit.com/u/${data.author}`)
            .setDescription(trim(data.selftext, 1024))
            .setImage(data.url)
            .setFooter({ text: data.subreddit_name_prefixed })
        ] });
    }

};
