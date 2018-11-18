const { Client } = require('klasa');
const { config, token } = require('./config');
const { blsAPIkey, bodAPIkey, dblAPIkey, dpwAPIkey, ctxAPIkey, idioticAPIkey } = require('./auth');
const fetch = require('node-fetch');
const idiotic = require('idiotic-api');

class Stalwartle extends Client {

	constructor(...args) {
		super(...args);

		Stalwartle.defaultClientSchema
			.add('bugChannel', 'textchannel')
			.add('suggestionChannel', 'textchannel')
			.add('changelogs', 'textchannel')
			.add('restart', restart => restart
				.add('channel', 'textchannel')
				.add('timestamp', 'number'))
			.add('errorHook', webhook => webhook
				.add('id', 'string')
				.add('token', 'string'));

		Stalwartle.defaultUserSchema
			.add('cookies', 'integer', { default: 0, configurable: false })
			.add('afktoggle', 'boolean', { default: false, configurable: true })
			.add('timezone', 'string', { default: 'GMT', configurable: false })
			.add('afkIgnore', 'channel', { array: true, default: [], configurable: true })
			.add('osu', 'string', { max: 20 });

		Stalwartle.defaultGuildSchema
			.add('muteRole', 'role', { configurable: true })
			.add('logging', 'boolean', { default: true, configurable: true })
			.add('modlogShowContent', 'boolean', { default: true, configurable: true })
			.add('ignored', 'channel', { array: true, default: [], configurable: true })
			.add('autorole', autorole => autorole
				.add('user', 'role', { configurable: true })
				.add('bot', 'role', { configurable: true }))
			.add('moderators', moderators => moderators
				.add('users', 'user', { array: true, default: [], configurable: true })
				.add('roles', 'role', { array: true, default: [], configurable: true }))
			.add('dj', dj => dj
				.add('users', 'user', { array: true, default: [], configurable: true })
				.add('roles', 'role', { array: true, default: [], configurable: true }))
			.add('modlogs', modlogs => modlogs
				.add('ban', 'channel', { configurable: true })
				.add('kick', 'channel', { configurable: true })
				.add('mute', 'channel', { configurable: true })
				.add('softban', 'channel', { configurable: true })
				.add('unban', 'channel', { configurable: true })
				.add('unmute', 'channel', { configurable: true })
				.add('warn', 'channel', { configurable: true }))
			.add('automod', automod => automod
				.add('ignoreBots', 'boolean', { default: false, configurable: true })
				.add('ignoreMods', 'boolean', { default: false, configurable: true })
				.add('antiInvite', 'boolean', { default: false, configurable: true })
				.add('quota', 'boolean', { default: true, configurable: true })
				.add('antiSpam', 'boolean', { default: false, configurable: true })
				.add('antiSwear', 'boolean', { default: false, configurable: true })
				.add('mentionSpam', 'boolean', { default: false, configurable: true })
				.add('globalSwears', 'boolean', { default: true, configurable: true })
				.add('swearWords', 'string', { array: true, default: [], configurable: true })
				.add('filterIgnore', filterIgnore => filterIgnore
					.add('antiInvite', 'channel', { array: true, default: [], configurable: true })
					.add('antiSpam', 'channel', { array: true, default: [], configurable: true })
					.add('antiSwear', 'channel', { array: true, default: [], configurable: true })
					.add('mentionSpam', 'channel', { array: true, default: [], configurable: true }))
				.add('options', options => options
					.add('antiInvite', antiInvite => antiInvite
						.add('action', 'string', { default: 'warn' })
						.add('duration', 'integer', { default: 5, min: 1, max: 43200, configurable: true }))
					.add('quota', quota => quota
						.add('action', 'string', { default: 'mute' })
						.add('limit', 'integer', { default: 3, min: 3, max: 50, configurable: true })
						.add('within', 'integer', { default: 5, min: 1, max: 1440, configurable: true })
						.add('duration', 'integer', { default: 10, min: 1, max: 43200, configurable: true }))
					.add('antiSpam', antiSpam => antiSpam
						.add('action', 'string', { default: 'mute' })
						.add('limit', 'integer', { default: 5, min: 5, max: 50 })
						.add('within', 'integer', { default: 5, min: 3, max: 600 })
						.add('duration', 'integer', { default: 5, min: 1, max: 43200, configurable: true }))
					.add('antiSwear', antiSwear => antiSwear
						.add('action', 'string', { default: 'warn' })
						.add('duration', 'integer', { default: 5, min: 1, max: 43200, configurable: true }))
					.add('mentionSpam', mentionSpam => mentionSpam
						.add('action', 'string', { default: 'ban' })
						.add('duration', 'integer', { default: 30, min: 1, max: 43200, configurable: true }))));

		Stalwartle.defaultPermissionLevels
			.add(5, (client, msg) => msg.guild && ((!msg.guild.settings.get('dj.users').length && !msg.guild.settings.get('dj.roles').length) || (msg.guild.settings.get('dj.roles').some(role => msg.member.roles.keyArray().includes(role)) || msg.guild.settings.get('dj.users').includes(msg.member.id)))) // eslint-disable-line max-len
			.add(6, (client, msg) => msg.guild && (msg.guild.settings.get('moderators.roles').some(role => msg.member.roles.keyArray().includes(role)) || msg.guild.settings.get('moderators.users').includes(msg.member.id))) // eslint-disable-line max-len
			.add(7, (client, msg) => msg.guild && msg.member.permissions.has('MANAGE_GUILD'))
			.add(8, (client, msg) => msg.guild && msg.member.permissions.has('ADMINISTRATOR'))
			.add(9, (client, msg) => config.owners.includes(msg.author.id))
			.add(10, (client, msg) => config.ownerID === msg.author.id);

		if (idioticAPIkey) {
			this.idiot = new idiotic.Client(idioticAPIkey, { dev: true });
			Object.defineProperty(this.idiot, 'token', { value: this.idiot.token, enumerable: false });
		}
	}

	async setGuildCount() {
		if (!this.application.botPublic) return null;
		if (ctxAPIkey) {
			fetch(`https://www.carbonitex.net/discord/data/botdata.php?key=${ctxAPIkey}&server_count=${await this.guildCount()}`, { method: 'POST' })
				.catch(err => this.emit('error', err.stack));
		}
		if (dblAPIkey) {
			fetch(`https://discordbots.org/api/bots/${this.user.id}/stats?server_count=${await this.guildCount()}`, {
				method: 'POST',
				headers: { Authorization: dblAPIkey }
			})
				.catch(err => this.emit('error', err.stack));
		}
		if (dpwAPIkey) {
			fetch(`https://bots.discord.pw/api/bots/${this.user.id}/stats?server_count=${await this.guildCount()}`, {
				method: 'POST',
				headers: { Authorization: dpwAPIkey }
			})
				.catch(err => this.emit('error', err.stack));
		}
		if (blsAPIkey) {
			fetch(`https://botlist.space/api/bots/${this.user.id}?server_count=${await this.guildCount()}`, {
				method: 'POST',
				headers: { Authorization: blsAPIkey }
			})
				.catch(err => this.emit('error', err.stack));
		}
		if (bodAPIkey) {
			fetch(`https://bots.ondiscord.xyz/bot-api/bots/${this.user.id}/guilds`, {
				method: 'POST',
				headers: { Authorization: bodAPIkey, 'Content-Type': 'application/json' },
				body: JSON.stringify({ guildCount: await this.guildCount() })
			})
				.catch(err => this.emit('error', err.stack));
		}
		return undefined;
	}

	async guildCount() {
		let guilds = 0;
		if (this.shard) {
			const results = await this.shard.broadcastEval('this.guilds.size');
			for (const result of results) guilds += result;
		} else {
			guilds = this.guilds.size;
		}
		return guilds;
	}

}

new Stalwartle(config).login(token);
