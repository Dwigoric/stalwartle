const { Listener, Events } = require('@sapphire/framework');

const statuses = [
    { name: 'dead', type: 'PLAYING' },
    { name: 'with your feelings', type: 'PLAYING' },
    { name: 'with sparkling 🔥', type: 'PLAYING' },
    { name: 'hide and seek', type: 'PLAYING' },
    { name: 'bad code', type: 'LISTENING' },
    { name: 'with magic', type: 'PLAYING' },
    { name: 'Cops and Robbers', type: 'PLAYING' },
    { name: 'Simon Says', type: 'PLAYING' },
    { name: 'I Spy', type: 'PLAYING' },
    { name: 'chess', type: 'PLAYING' },
    { name: 'with a rubber duck', type: 'PLAYING' },
    { name: 'your movements', type: 'WATCHING' },
    { name: 'Stranger Things', type: 'WATCHING' },
    { name: 'Gravity Falls', type: 'WATCHING' },
    { name: 'anime', type: 'WATCHING' },
    { name: 'Spotify', type: 'LISTENING' },
    { name: 'Pop Rock', type: 'LISTENING' },
    { name: 'P!ATD', type: 'LISTENING' },
    { name: 'Fall Out Boy', type: 'LISTENING' },
    { name: 'Ariana Grande', type: 'LISTENING' }
];

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.ClientReady, once: true });
    }

    async run() {
        await this.container.database.init()
            .then(() => this.container.logger.info('Connection to MongoDB has been established.'))
            .catch(error => {
                this.container.logger.error(error);
                throw new Error('Could not establish connection to MongoDB.');
            });
        for (const gateway of this.container.stores.get('gateways').values()) {
            await gateway.init().catch(error => {
                this.container.logger.error(error);
                throw new Error(`Could not load Collection ${gateway.name} to cache.`);
            });
            this.container.logger.info(`Loaded Collection ${gateway.name} to cache.`);
        }
        this.container.logger.info('The gateways have been loaded.');

        this.container.client.fetchPrefix = message => {
            if (message.guild) return this.container.stores.get('gateways').get('guildGateway').get(message.guild.id).prefix;
            return this.container.client.options.defaultPrefix;
        };

        await Promise.all(this.container.stores.map(store => Promise.all(store.map(piece => {
            if (piece.init) return piece.init();
            return null;
        }))));
        if (this.container.client.application.partial) this.container.client.application.fetch().catch(error => this.container.logger.warn('Could not fetch ClientApplicaton:', error));
        this.container.client.user.setPresence({ status: 'online' });
        this.container.client.user.setActivity('Just started running! 👀', { type: 'WATCHING' });
        this.container.client.setInterval(() => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            this.container.client.user.setActivity(`${status.name} | ${this.container.client.options.defaultPrefix}help`, { type: status.type });
        }, 60000);
    }

};
