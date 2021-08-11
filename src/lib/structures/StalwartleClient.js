const { SapphireClient } = require('@sapphire/framework');
const { Manager } = require('@lavacord/discord.js');
const { SpotifyParser } = require('spotilink');
const fetch = require('node-fetch');

const { config: { lavalinkNodes }, config } = require('../../config');

const constants = require('../util/constants');
const auth = require('../../auth');

const PersistenceManager = require('./settings/PersistenceManager');
const GatewayManager = require('./settings/GatewayManager');
const Schema = require('./settings/schema/Schema');

require('./StalwartleGuild');
require('./StalwartleGuildMember');

class Stalwartle extends SapphireClient {

	constructor(clientOptions) {
		super(clientOptions);

		this.playerManager = null;
		this.spotifyParser = null;
		this.constants = constants;
		this.auth = auth;

		this.once('ready', this._initplayer.bind(this));

		this.provider = new PersistenceManager();
		this.gateways = new GatewayManager(this);

		const guildSchema = this.constructor.defaultGuildSchema;
		const userSchema = this.constructor.defaultUserSchema;
		const clientSchema = this.constructor.defaultClientSchema;

		const prefixKey = guildSchema.get('prefix');
		if (!prefixKey || prefixKey.default === null) {
			guildSchema.add('prefix', 'string', { array: Array.isArray(this.options.defaultPrefix), default: this.options.defaultPrefix });
		}

		clientSchema
			.add('changelogs', 'textchannel')
			.add('bugs', bugs => bugs
				.add('reports', 'textchannel')
				.add('processed', 'textchannel'))
			.add('errorHook', errorHook => errorHook
				.add('id', 'string')
				.add('token', 'string'))
			.add('guildHook', guildHook => guildHook
				.add('id', 'string')
				.add('token', 'string'))
			.add('restart', restart => restart
				.add('channel', 'textchannel')
				.add('timestamp', 'number'))
			.add('suggestions', suggestions => suggestions
				.add('reports', 'textchannel')
				.add('processed', 'textchannel'));

		userSchema
			.add('acceptFights', 'boolean', { default: true })
			.add('afkIgnore', 'channel', { array: true })
			.add('afktoggle', 'boolean', { default: false })
			.add('bannerWidth', 'integer', { default: 0 })
			.add('cookies', 'integer', { default: 0, configurable: false })
			.add('hpBoost', 'integer', { default: 0, configurable: false })
			.add('osu', 'string', { max: 20 })
			.add('timezone', 'string', { default: 'GMT', configurable: false });

		guildSchema
			.add('afkChannelOnAfk', 'boolean', { default: false })
			.add('donation', 'number', { default: 0, configurable: false })
			.add('globalBans', 'boolean', { default: false })
			.add('ignored', 'channel', { array: true })
			.add('logging', 'boolean', { default: true })
			.add('modlogShowContent', 'boolean', { default: true })
			.add('muted', 'user', { array: true, configurable: false })
			.add('muteRole', 'role', { configurable: false })
			.add('selfroles', 'role', { array: true })
			.add('autorole', autorole => autorole
				.add('user', 'role')
				.add('bot', 'role'))
			.add('moderators', moderators => moderators
				.add('users', 'user', { array: true })
				.add('roles', 'role', { array: true }))
			.add('modlogs', modlogs => modlogs
				.add('ban', 'channel')
				.add('kick', 'channel')
				.add('mute', 'channel')
				.add('softban', 'channel')
				.add('unban', 'channel')
				.add('unmute', 'channel')
				.add('warn', 'channel'))
			.add('music', music => music
				.add('limitToChannel', 'channel', { array: true })
				.add('announceChannel', 'textchannel')
				.add('announceSongs', 'boolean', { default: true })
				.add('autoplay', 'boolean', { default: false })
				.add('dj', 'role', { array: true })
				.add('maxPlaylist', 'integer', { min: 1, max: 1000, default: 1000 })
				.add('maxQueue', 'integer', { min: 1, max: 1000, default: 1000 })
				.add('maxUserRequests', 'integer', { min: 1, max: 1000, default: 250 })
				.add('noDuplicates', 'boolean', { default: false })
				.add('repeat', 'string', { default: 'none', configurable: false })
				.add('volume', 'integer', { min: 1, max: 300, default: 100, configurable: false }))
			.add('automod', automod => automod
				.add('ignoreBots', 'boolean', { default: false })
				.add('ignoreMods', 'boolean', { default: false })
				.add('antiInvite', 'boolean', { default: false })
				.add('quota', 'boolean', { default: true })
				.add('antiSpam', 'boolean', { default: false })
				.add('antiSwear', 'boolean', { default: false })
				.add('mentionSpam', 'boolean', { default: false })
				.add('globalSwears', 'boolean', { default: true })
				.add('swearWords', 'string', { array: true })
				.add('filterIgnore', filterIgnore => filterIgnore
					.add('antiInvite', 'channel', { array: true })
					.add('antiSpam', 'channel', { array: true })
					.add('antiSwear', 'channel', { array: true })
					.add('mentionSpam', 'channel', { array: true }))
				.add('options', options => options
					.add('antiInvite', antiInvite => antiInvite
						.add('action', 'string', { default: 'warn', configurable: false })
						.add('duration', 'integer', { default: 5, min: 1, max: 43200 }))
					.add('quota', quota => quota
						.add('action', 'string', { default: 'mute', configurable: false })
						.add('limit', 'integer', { default: 3, min: 3, max: 50 })
						.add('within', 'integer', { default: 5, min: 1, max: 1440 })
						.add('duration', 'integer', { default: 10, min: 1, max: 43200 }))
					.add('antiSpam', antiSpam => antiSpam
						.add('action', 'string', { default: 'mute', configurable: false })
						.add('limit', 'integer', { default: 5, min: 5, max: 50 })
						.add('within', 'integer', { default: 5, min: 3, max: 600 })
						.add('duration', 'integer', { default: 5, min: 1, max: 43200 }))
					.add('antiSwear', antiSwear => antiSwear
						.add('action', 'string', { default: 'warn', configurable: false })
						.add('duration', 'integer', { default: 5, min: 1, max: 43200 }))
					.add('mentionSpam', mentionSpam => mentionSpam
						.add('action', 'string', { default: 'ban', configurable: false })
						.add('duration', 'integer', { default: 30, min: 1, max: 43200 }))));

		this.gateways
			.register('guilds', guildSchema)
			.register('users', userSchema)
			.register('clientStorage', clientSchema);

		this.settings = null;
		this.application = null;
		this.ready = false;

		Stalwartle.defaultPermissionLevels
			.add(5, ({ guild, member }) => guild && (!guild.settings.get('music.dj').length || guild.settings.get('music.dj').some(role => member.roles.cache.keyArray().includes(role))))
			.add(6, ({ guild, member }) => guild && (guild.settings.get('moderators.roles').some(role => member.roles.cache.keyArray().includes(role)) || guild.settings.get('moderators.users').includes(member.id))) // eslint-disable-line max-len
			.add(7, ({ guild, member }) => guild && member.permissions.has('MANAGE_GUILD'))
			.add(8, ({ guild, member }) => guild && member.permissions.has('ADMINISTRATOR'))
			.add(9, ({ author }) => clientOptions.owners.includes(author.id))
			.add(10, ({ author }) => clientOptions.ownerID === author.id, { break: true });
	}

	async postStats() {
		if (this.auth.ctxAPIkey) {
			fetch('https://www.carbonitex.net/discord/data/botdata.php', {
				method: 'POST',
				body: JSON.stringify({ key: this.auth.ctxAPIkey, server_count: await this.guildCount() }), // eslint-disable-line camelcase
				headers: { 'Content-Type': 'application/json' }
			});
		}
		if (this.auth.dblAPIkey) {
			fetch(`https://top.gg/api/bots/${this.user.id}/stats`, {
				method: 'POST',
				body: JSON.stringify({ server_count: await this.guildCount(), shard_count: this.options.shardCount }), // eslint-disable-line camelcase
				headers: { Authorization: this.auth.dblAPIkey, 'Content-Type': 'application/json' }
			});
		}
		if (this.auth.dbl2APIkey) {
			fetch(`https://discordbotlist.com/api/v1/bots/${this.user.id}/stats`, {
				method: 'POST',
				body: JSON.stringify({
					guilds: await this.guildCount(),
					users: await this.userCount(),
					voice_connections: Array.from(this.playerManager.players.values()).filter(player => player.playing).length // eslint-disable-line camelcase
				}),
				headers: { Authorization: `Bot ${this.auth.dbl2APIkey}`, 'Content-Type': 'application/json' }
			});
		}
		if (this.auth.dcbAPIkey) {
			fetch(`https://discord.bots.gg/api/v1/bots/${this.user.id}/stats`, {
				method: 'POST',
				body: JSON.stringify({ guildCount: await this.guildCount() }),
				headers: { Authorization: this.auth.dcbAPIkey, 'Content-Type': 'application/json' }
			});
		}
		if (this.auth.blsAPIkey) {
			fetch(`https://api.botlist.space/v1/bots/${this.user.id}`, {
				method: 'POST',
				body: JSON.stringify({ server_count: await this.guildCount() }), // eslint-disable-line camelcase
				headers: { Authorization: this.auth.blsAPIkey, 'Content-Type': 'application/json' }
			});
		}
		if (this.auth.bodAPIkey) {
			fetch(`https://bots.ondiscord.xyz/bot-api/bots/${this.user.id}/guilds`, {
				method: 'POST',
				body: JSON.stringify({ guildCount: await this.guildCount() }),
				headers: { Authorization: this.auth.bodAPIkey, 'Content-Type': 'application/json' }
			});
		}
	}

	async guildCount() {
		let guilds = 0;
		if (this.shard) {
			const results = await this.shard.broadcastEval('this.guilds.cache.size');
			for (const result of results) guilds += result;
		} else {
			guilds = this.guilds.cache.size;
		}
		return guilds;
	}

	async userCount() {
		let users = 0;
		if (this.shard) {
			const results = await this.shard.broadcastEval('this.guilds.cache.reduce((a, b) => a + b.memberCount, 0)');
			for (const result of results) users += result;
		} else {
			users = this.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
		}
		return users;
	}

	async login(token) {
		await this.provider.init().catch(() => new Error('Could not establish connection to MongoDB.'));
		console.log('Connection to MongoDB has been established.');
		await this.gateways.init().catch(() => new Error('The gateways could not load successfully.'));
		console.log('The gateways have been loaded.');
		return super.login(token);
	}

	_initplayer() {
		this.playerManager = this.playerManager || new Manager(this, lavalinkNodes, {
			user: this.user.id,
			shards: this.options.shardCount
		});
		this.spotifyParser = new SpotifyParser(lavalinkNodes[0], this.auth.spotifyClientID, this.auth.spotifyClientSecret);
		if (!this.playerManager.idealNodes.length) this.playerManager.connect();
		return true;
	}

}

Stalwartle.defaultGuildSchema = new Schema()
	.add('prefix', 'string')
	.add('disableNaturalPrefix', 'boolean', { configurable: Boolean(this.options.regexPrefix) })
	.add('disabledCommands', 'commands', {
		array: true,
		filter: (client, command) => {
			if (config.guardedCommands.includes(command.name)) throw `${constants.EMOTES.xmark}  ::  The command \`${command.name.toLowerCase()}\` may not be disabled.`;
		}
	});

Stalwartle.defaultUserSchema = new Schema();

Stalwartle.defaultClientSchema = new Schema()
	.add('userBlacklist', 'user', { array: true })
	.add('guildBlacklist', 'string', { array: true });

module.exports = Stalwartle;
