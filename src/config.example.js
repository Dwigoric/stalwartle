const { LogLevel } = require('@sapphire/framework');
const { ScheduledTaskRedisStrategy } = require('@sapphire/plugin-scheduled-tasks/register-redis');

exports.config = {
    /**
     * General Options
     */
    // The default configurable prefix for each guild
    defaultPrefix: 's.',
    // If the bot will be insensitive to the prefix case
    caseInsensitivePrefixes: true,
    // If the bot will be insensitive to the command case
    caseInsensitiveCommands: true,
    // If your bot should be able to mention
    allowedMentions: ['roles', 'users'],
    // The time in ms to add to ratelimits, to ensure you won't hit a 429 response
    restTimeOffset: 500,
    // A presence to login with
    presence: { status: 'idle', activities: [{ name: 'Loading...', type: 'PLAYING' }] },
    // Intents
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_WEBHOOKS', 'GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES'],

    ownerID: '295391820744228867',
    developers: ['295391820744228867', '296862433136476160', '296256174209105920'],

    lavalinkNodes: [{ id: 'server', host: 'localhost', port: 80, password: '' }],

    // The guarded commands
    guardedCommands: [],

    // Schedule options
    tasks: {
        strategy: new ScheduledTaskRedisStrategy({
            bull: {
                redis: {
                    host: 'localhost'
                }
            }
        })
    },

    // Logger options
    logger: {
        level: LogLevel.Info
    },

    /**
     * Caching Options
     */
    partials: ['GUILD_MEMBER', 'USER'],
    sweepers: {
        messages: {
            interval: 30,
            lifetime: 60
        }
    },

    /**
     * Sharding Options
     */
    shards: 'auto',
    shardCount: 1
};

exports.mongodb = {
    // The Mongo DB connection string
    connectionString: '',

    // The DB name
    name: '',

    // Additional options for Mongo DB
    options: {}
};

// The token for this bot to login with
exports.token = '';
