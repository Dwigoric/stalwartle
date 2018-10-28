const { Client } = require('klasa');
const { config, token } = require('./config');
const { blsAPIkey, dblAPIkey, dpwAPIkey, ctxAPIkey, idioticAPIkey } = require('./auth');
const snekfetch = require('snekfetch');
const idiotic = require('idiotic-api');

class Stalwartle extends Client {

	constructor(...args) {
		super(...args);

		Stalwartle.defaultClientSchema
			.add('restart', 'string', { default: '', configurable: false });

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
				.add('autoMute', 'boolean', { default: true, configurable: true })
				.add('antiSpam', 'boolean', { default: false, configurable: true })
				.add('antiSwear', 'boolean', { default: false, configurable: true })
				.add('mentionSpam', 'boolean', { default: false, configurable: true })
				.add('globalSwears', 'boolean', { default: true, configurable: true })
				.add('swearWords', 'string', { array: true, default: [], configurable: true })
				.add('filterIgnore', filterIgnore => filterIgnore
					.add('antiInvite', 'channel', { array: true, default: [], configurable: true })
					.add('antiSpam', 'channel', { array: true, default: [], configurable: true })
					.add('antiSwear', 'channel', { array: true, default: [], configurable: true })
					.add('mentionSpam', 'channel', { array: true, default: [], configurable: true })));

		Stalwartle.defaultPermissionLevels
			.add(6, (client, msg) => msg.guild && (msg.guild.settings.moderators.roles.some(role => msg.member.roles.keyArray().includes(role)) || msg.guild.settings.moderators.users.includes(msg.member.id))) // eslint-disable-line max-len
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
			snekfetch.post('https://www.carbonitex.net/discord/data/botdata.php')
				.send({
					key: ctxAPIkey,
					server_count: await this.guildCount() // eslint-disable-line camelcase
				})
				.catch(err => this.emit('error', err.stack));
		}
		if (dblAPIkey) {
			snekfetch.post(`https://discordbots.org/api/bots/${this.user.id}/stats`)
				.set('Authorization', dblAPIkey)
				.send({ server_count: await this.guildCount() }) // eslint-disable-line camelcase
				.catch(err => this.emit('error', err.stack));
		}
		if (dpwAPIkey) {
			snekfetch.post(`https://bots.discord.pw/api/bots/${this.user.id}/stats`)
				.set('Authorization', dpwAPIkey)
				.send({ server_count: await this.guildCount() }) // eslint-disable-line camelcase
				.catch(err => this.emit('error', err.stack));
		}
		if (blsAPIkey) {
			snekfetch.post(`https://botlist.space/api/bots/${this.user.id}`)
				.set('Authorization', blsAPIkey)
				.send({ server_count: await this.guildCount() }) // eslint-disable-line camelcase
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
