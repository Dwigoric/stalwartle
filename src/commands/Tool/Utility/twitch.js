const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const TWITCH_CLIENT_ID = 'd7sds6f41zr45c3wxkqkkslpcjukig';
let TWITCH_API_TOKEN = '';

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Returns information on a Twitch.tv Account',
            usage: '<TwitchName:string>'
        });
    }

    async run(msg, [twitchName]) {
        await msg.send(`${this.container.client.constants.EMOTES.loading}  ::  Loading Twitch channel...`);

        const channel = await fetch(`https://api.twitch.tv/helix/users?login=${twitchName}`, {
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${TWITCH_API_TOKEN}`
            }
        })
            .then(async res => {
                if (!res.ok) throw `${this.container.client.constants.EMOTES.xmark}  ::  An error occurred: \`${await res.json().then(data => data.message)}\``;
                return res.json();
            })
            .then(res => {
                if (!res.data.length) throw `${this.container.client.constants.EMOTES.xmark}  ::  There is no Twitch streamer with that name.`;
                return res.data[0];
            });

        return msg.sendEmbed(new MessageEmbed()
            .setColor(6570406)
            .setThumbnail(channel.profile_image_url)
            .setAuthor(channel.display_name, 'https://i.imgur.com/OQwQ8z0.jpg', `https://twitch.tv/${channel.display_name}`)
            .setDescription(channel.description)
            .setFooter('Click at the account name above to go to the channel.')
            .addField('Account ID', channel.id, true)
            .addField('Channel Views', channel.view_count, true));
    }

    async renewToken() {
        const params = new URLSearchParams();
        params.set('client_id', TWITCH_CLIENT_ID);
        params.set('client_secret', this.container.client.auth.twitchAPIkey);
        params.set('grant_type', 'client_credentials');
        const { access_token, expires_in } = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: 'POST' }).then(res => res.json()); // eslint-disable-line camelcase

        TWITCH_API_TOKEN = access_token; // eslint-disable-line camelcase
        return expires_in; // eslint-disable-line camelcase
    }

    async _renew() {
        this.container.client.setTimeout(this._renew.bind(this), await this.renewToken());
    }

    async init() {
        this._renew();
    }

};
