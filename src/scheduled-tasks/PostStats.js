const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');
const fetch = require('node-fetch');

module.exports = class PostStatsTask extends ScheduledTask {

    constructor(context, options) {
        super(context, {
            ...options,
            cron: '*/10 * * * *'
        });
    }

    async run() {
        if (process.env.BOTSONDISCORD_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://bots.ondiscord.xyz/bot-api/bots/${this.container.client.user.id}/guilds`, {
                method: 'POST',
                body: JSON.stringify({ guildCount: await this.container.client.guildCount() }),
                headers: { Authorization: process.env.BOTSONDISCORD_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => this.container.logger.error(err));
        }

        if (process.env.CARBONITEX_API_KEY) { // eslint-disable-line no-process-env
            fetch('https://www.carbonitex.net/discord/data/botdata.php', {
                method: 'POST',
                body: JSON.stringify({ key: process.env.CARBONITEX_API_KEY, server_count: await this.container.client.guildCount() }), // eslint-disable-line camelcase,no-process-env
                headers: { 'Content-Type': 'application/json' }
            }).catch(err => this.container.logger.error(err));
        }

        if (process.env.DISCORDBOTLIST_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://discordbotlist.com/api/v1/bots/${this.container.client.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({
                    guilds: await this.container.client.guildCount(),
                    users: await this.container.client.userCount(),
                    voice_connections: this.container.erela.players.filter(player => player.playing).size // eslint-disable-line camelcase
                }),
                headers: { Authorization: process.env.DISCORDBOTLIST_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => this.container.logger.error(err));
        }

        if (process.env.DISCORDBOTSGG_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://discord.bots.gg/api/v1/bots/${this.container.client.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({ guildCount: await this.container.client.guildCount() }),
                headers: { Authorization: process.env.DISCORDBOTSGG_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => this.container.logger.error(err));
        }

        if (process.env.DISCORDLISTSPACE_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://api.discordlist.space/v2/bots/${this.container.client.user.id}`, {
                method: 'POST',
                body: JSON.stringify({ serverCount: await this.container.client.guildCount() }),
                headers: { Authorization: process.env.DISCORDLISTSPACE_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => this.container.logger.error(err));
        }

        if (process.env.TOPGG_API_KEY) { // eslint-disable-line no-process-env
            fetch(`https://top.gg/api/bots/${this.container.client.user.id}/stats`, {
                method: 'POST',
                body: JSON.stringify({ server_count: await this.container.client.guildCount(), shard_count: this.container.client.options.shardCount }), // eslint-disable-line camelcase
                headers: { Authorization: process.env.TOPGG_API_KEY, 'Content-Type': 'application/json' } // eslint-disable-line no-process-env
            }).catch(err => this.container.logger.error(err));
        }
    }

    async init() {
        this.run();
    }

};
