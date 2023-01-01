const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Returns information on a Twitch.tv Account'
        });
        this.usage = 'TwitchName:string';
    }

    #TWITCH_CLIENT_ID = '';
    #TWITCH_API_TOKEN = '';

    async messageRun(msg, args) {
        let twitchName = await args.pickResult('string');
        if (!twitchName.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the Twitch channel.`);
        twitchName = twitchName.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading Twitch channel...`);

        const channel = await fetch(`https://api.twitch.tv/helix/users?login=${twitchName}`, {
            headers: {
                'Client-ID': this.#TWITCH_CLIENT_ID,
                Authorization: `Bearer ${this.#TWITCH_API_TOKEN}`
            }
        })
            .then(async res => {
                if (!res.ok) return [0, await res.json().then(data => data.message)];
                return res.json();
            })
            .then(res => {
                if (!res.data.length) return [1];
                return res.data[0];
            });

        if (Array.isArray(channel)) {
            if (channel[0] === 0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  An error occurred: \`${channel[1]}\``);
            else if (channel[0] === 1) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no Twitch streamer with that name.`);
        }

        return reply(msg, { embeds: [new MessageEmbed()
            .setColor(6570406)
            .setThumbnail(channel.profile_image_url)
            .setAuthor({ name: channel.display_name, iconURL: 'https://i.imgur.com/OQwQ8z0.jpg', url: `https://twitch.tv/${channel.display_name}` })
            .setDescription(channel.description)
            .setFooter({ text: 'Click at the account name above to go to the channel.' })
            .addField('Account ID', channel.id, true)
            .addField('Channel Views', String(channel.view_count), true)
        ] });
    }

    async #renewToken() {
        const params = new URLSearchParams();
        params.set('client_id', this.#TWITCH_CLIENT_ID);
        params.set('client_secret', process.env.TWITCH_API_KEY); // eslint-disable-line no-process-env
        params.set('grant_type', 'client_credentials');
        const { access_token, expires_in } = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: 'POST' }).then(res => res.json()); // eslint-disable-line camelcase

        this.#TWITCH_API_TOKEN = access_token; // eslint-disable-line camelcase
        return expires_in; // eslint-disable-line camelcase
    }

    async #renew() {
        this.container.client.setTimeout(this.#renew.bind(this), await this.#renewToken());
    }

    async init() {
        this.#TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID; // eslint-disable-line no-process-env
        this.#renew();
    }

};
