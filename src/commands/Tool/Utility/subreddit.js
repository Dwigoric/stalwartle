const { Command } = require('@sapphire/framework');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['sub'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Returns information on a subreddit.'
        });
        this.usage = '<Subreddit:string>';
    }

    async messageRun(msg, args) {
        let subredditName = await args.pickResult('string');
        if (!subredditName.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the subreddit you want to get information about.`);
        subredditName = subredditName.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading subreddit...`);

        let subreddit = await fetch(`https://www.reddit.com/r/${subredditName}/about.json`)
            .then(res => res.json())
            .catch(() => null);
        if (subreddit === null) return reply(msg, 'There was an error. Reddit may be down, or the subreddit doesn\'t exist.');
        if (subreddit.kind !== 't5') return reply(msg, `Subreddit ${subredditName} doesn't exist.`);

        subreddit = subreddit.data;

        return reply(msg, { embeds: [new MessageEmbed()
            .setTitle(subreddit.title)
            .setDescription(subreddit.public_description)
            .setURL(`https://www.reddit.com/r/${subredditName}/`)
            .setColor(6570404)
            .setThumbnail(subreddit.icon_img)
            .setImage(subreddit.banner_img)
            .addField('Subscribers', subreddit.subscribers.toLocaleString(), true)
            .addField('Users Active', subreddit.accounts_active.toLocaleString(), true)
        ] });
    }

};
