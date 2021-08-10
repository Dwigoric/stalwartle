const { Options } = require('discord.js');

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

	ownerID: '295391820744228867',
	developers: ['295391820744228867', '296862433136476160', '296256174209105920'],

	lavalinkNodes: [{ id: 'server', host: 'localhost', port: 80, password: '' }],

	/**
     * Caching Options
     */
	partials: ['GUILD_MEMBER', 'USER'],
	makeCache: Options.cacheWithLimits({
		MessageManager: {
			maxSize: 100,
			sweepInterval: 30,
			sweepFilter: coll => coll.filterByLifetime({ lifetime: 60 })
		},
		PresenceManager: { maxSize: 0 }
	}),

	/**
     * Sharding Options
     */
	shards: 'auto',
	shardCount: 1
};

exports.mongodb = {
	// The Mongo DB connection string
	connectionString: '',

	// Additional options for Mongo DB
	options: {}
};

// The token for this bot to login with
exports.token = '';
