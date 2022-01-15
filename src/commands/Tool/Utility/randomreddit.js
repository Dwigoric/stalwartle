const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Returns a random reddit post on a given subreddit.',
            usage: '<Subreddit:str>'
        });
        this.errorMessage = `${this.container.constants.EMOTES.xmark}  ::  There was an error. Reddit may be down, or the subreddit doesn't exist.`;
    }

    async messageRun(msg, [subreddit]) {
        await msg.send(`${this.container.constants.EMOTES.loading}  ::  Loading reddit post...`);
        const { data } = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`)
            .then(res => res.json())
            .then(res => {
                if (res.error) throw this.errorMessage;
                return res[0].data.children[0];
            })
            .catch(() => { throw this.errorMessage; });

        if (data.over_18 && !msg.channel.nsfw) throw `${this.container.constants.EMOTES.xmark}  ::  The post contains NSFW content and this channel is not marked as NSFW.`;

        if (Boolean(msg.guild) && !msg.channel.permissionsFor(this.container.client.user).has('EMBED_LINKS')) return msg.sendMessage(`***${data.title}***\n\n${data.url}`);

        const trim = (str, max) => str.length > max ? `${str.slice(0, max)}...` : str;
        return msg.sendEmbed(new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(trim(data.title, 253), null, `https://www.reddit.com${data.permalink}`)
            .setTitle(`u/${data.author}`)
            .setURL(`https://www.reddit.com/u/${data.author}`)
            .setDescription(trim(data.selftext, 1024))
            .setImage(data.url)
            .setFooter(data.subreddit_name_prefixed));
    }

};
