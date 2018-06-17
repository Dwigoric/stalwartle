const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild) return;
		if (!msg.guild.configs.automod.antiSwear) return;
		if (msg.author.bot && msg.guild.configs.automod.ignoreBots) return;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.configs.automod.ignoreMods) return;
		if (msg.guild.configs.automod.filterIgnore.antiSwear.includes(msg.channel.id)) return;

		let swearArray = msg.guild.configs.automod.swearWords.map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		if (msg.guild.configs.automod.globalSwears) {
			swearArray = swearArray.concat([
				'nigga',
				'nigger',
				'fuc?k',
				'cunt',
				'cnut',
				'b(i|1|!)tch',
				'd(i|1)ck',
				'pussy',
				'asshole',
				'blowjob',
				'c(u|0|o|\\(\\))ck'
			]).map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		}
		if (!swearArray.length) return;
		const swearRegex = new RegExp(swearArray.join('|'), 'im');
		if (!swearRegex.test(msg.content)) return;
		if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No swearing allowed, or I'll punish you!`);
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.delete();
		this.client.finalizers.get('modlogging').run({
			command: this.client.commands.get('warn'),
			channel: msg.channel,
			guild: msg.guild
		}, [msg.author, 'Swearing with the AntiSwear enabled', null, msg.content.length > 900 ? swearRegex.exec(msg.content)[0] : msg.content]);
	}

	async init() {
		await this.client.commands.get('automod').init();
		const automodSchema = this.client.gateways.guilds.schema.automod;
		if (!automodSchema.antiSwear) await automodSchema.add('antiSwear', { type: 'boolean', default: false, configurable: true });
		if (!automodSchema.globalSwears) await automodSchema.add('globalSwears', { type: 'boolean', default: true, configurable: true });
		if (!automodSchema.swearWords) await automodSchema.add('swearWords', { type: 'string', array: true, default: [], configurable: true });
	}

};
