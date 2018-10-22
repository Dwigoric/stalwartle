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
	// If custom configs should be preserved when a guild removes your bot
	preserveSettings: true,
	// Whether d.js should queue your rest request in 'sequential' or 'burst' mode
	apiRequestMethod: 'sequential',
	// If your bot should be able to mention @everyone
	disableEveryone: true,
	// The time in ms to add to ratelimits, to ensure you won't hit a 429 response
	restTimeOffset: 500,
	// Any Websocket Events you don't want to listen to
	disabledEvents: [],
	// A presence to login with
	presence: { status: 'online' },
	// A once ready message for your console
	readyMessage: (client) => `${client.user.tag} has been given birth. Currently playing on ${client.guilds.size} servers with ${client.guilds.reduce((a, b) => a + b.memberCount, 1)} users.`,

	ownerID: '295391820744228867',
	owners: ['295391820744228867', '296862433136476160', '296256174209105920', '147891648628654082'],
	/**
     * Caching Options
     */
	fetchAllMembers: true,
	messageCacheMaxSize: 200,
	messageCacheLifetime: 0,
	commandMessageLifetime: 1800,
	// The above 2 options are ignored while the interval is 0
	messageSweepInterval: 0,

	/**
     * Sharding Options
     */
	shardId: 0,
	shardCount: 0,

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
		default: 'rethinkdb'
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
		guilds: { provider: 'rethinkdb' },
		users: { provider: 'rethinkdb' },
		clientStorage: { provider: 'rethinkdb' }
	},

	/**
     * Klasa Schedule Options
     */
	schedule: { interval: 1000 }
};

// The token for this bot to login with
exports.token = process.env.SECRET; // eslint-disable-line no-process-env
