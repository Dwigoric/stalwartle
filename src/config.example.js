exports.config = {
	/**
     * General Options
     */
	// Disables/Enables a process.on('unhandledRejection'...) handler
	production: false,
	// The default language that comes with klasa. More base languages can be found on Klasa-Pieces
	language: 'en-US',
	// The default configurable prefix for each guild
	prefix: 's.',
	// Whether to accept unprefixed commands in DMs
	noPrefixDM: true,
	// If the bot will be insensitive to the prefix case
	prefixCaseInsensitive: true,
	// If custom configs should be preserved when a guild removes your bot
	preserveSettings: true,
	// If your bot should be able to mention
	disableMentions: 'none',
	// The time in ms to add to ratelimits, to ensure you won't hit a 429 response
	restTimeOffset: 500,
	// A presence to login with
	presence: { status: 'idle', activity: { name: 'Loading...', type: 'PLAYING' } },
	// A once ready message for your console
	readyMessage: (client) => `${client.user.tag} has been given birth. Currently playing on ${client.guilds.cache.size} servers with ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 1)} users.`,
	// Amount of time before the bot will respond to a user's command since the last command that user has run
	slowmode: 3000,
	// If the slowmode time should reset if a user spams commands faster than the slowmode allows for
	slowmodeAggressive: false,

	ownerID: '295391820744228867',
	owners: ['295391820744228867', '296862433136476160', '296256174209105920'],
	rethinkdbName: 'Stalwartle',

	lavalinkNodes: [{ id: 'server', host: 'localhost', port: 80, password: '' }],
	/**
     * Caching Options
     */
	fetchAllMembers: false,
	messageCacheMaxSize: 200,
	messageCacheLifetime: 120,
	commandMessageLifetime: 300,
	// The above 2 options are ignored while the interval is 0
	messageSweepInterval: 120,

	/**
     * Sharding Options
     */
	shards: 'auto'
	shardCount: 1,

	/**
     * Command Handler Options
     */
	commandEditing: true,
	commandLogging: true,
	typing: false,

	/**
     * Database Options
     */
	providers: {
		/*
        // Provider Connection object for process based databases:
        // rethinkdb, mongodb, mssql, mysql, postgresql
        mysql: {
            host: 'localhost',
            db: 'klasa',
            user: 'database-user',
            password: 'database-password',
            options: {}
        },
        */
		default: 'json'
	},

	/**
     * Custom Prompt Defaults
     */
	customPromptDefaults: {
		promptTime: 30000,
		promptLimit: Infinity,
		quotedStringSupport: false
	},

	/**
     * Klasa Piece Defaults
     */
	pieceDefaults: {
		commands: {
			aliases: [],
			autoAliases: true,
			requiredPermissions: 0,
			bucket: 1,
			cooldown: 5,
			description: '',
			enabled: true,
			flagSupport: true,
			guarded: false,
			nsfw: false,
			permissionLevel: 0,
			promptLimit: 0,
			promptTime: 30000,
			requiredSettings: [],
			runIn: ['text', 'dm', 'group'],
			subcommands: false,
			usage: '',
			quotedStringSupport: false,
			deletable: true
		},
		events: {
			enabled: true,
			once: false
		},
		extendables: {
			enabled: true,
			klasa: false,
			appliesTo: []
		},
		finalizers: { enabled: true },
		inhibitors: {
			enabled: true,
			spamProtection: false
		},
		languages: { enabled: true },
		monitors: {
			enabled: true,
			ignoreBots: true,
			ignoreSelf: true,
			ignoreOthers: true,
			ignoreWebhooks: true,
			ignoreEdits: true
		},
		providers: {
			enabled: true,
			sql: false,
			cache: false
		},
		tasks: { enabled: true }
	},

	/**
     * Console Event Handlers (enabled/disabled)
     */
	consoleEvents: {
		debug: false,
		error: true,
		log: true,
		verbose: false,
		warn: true,
		wtf: true
	},

	/**
     * Console Options
     */
	console: {
		// Alternatively a Moment Timestamp string can be provided to customize the timestamps.
		timestamps: true,
		utc: false,
		useColor: true,
		colors: {
			debug: { time: { background: 'magenta' } },
			error: { time: { background: 'red' } },
			log: { time: { background: 'blue' } },
			verbose: { time: { text: 'gray' } },
			warn: { time: { background: 'lightyellow', text: 'black' } },
			wtf: { message: { text: 'red' }, time: { background: 'red' } }
		}
	},

	/**
     * Custom Setting Gateway Options
     */
	gateways: {
		guilds: { provider: 'json' },
		users: { provider: 'json' },
		clientStorage: { provider: 'json' }
	},

	/**
     * Klasa Schedule Options
     */
	schedule: { interval: 1000 }
};

// The token for this bot to login with
exports.token = '';
