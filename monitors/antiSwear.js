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

		let swearArray;
		if (msg.guild.configs.automod.globalSwears) {
			swearArray = [
				'[n𝗇ηꓠ𝚗🆖🇳][iι_y🇮𝗂іjï1ı🆖l|\u005c\u002f\u007c!¡]{1,50}[g🇬6ɡɢġģǧǵ9q]{2,}[3🇪€εεeéěȩėеiua0o]{1,50}[rŕřŗṙ🇷]',
				'fuc?k',
				'cunt',
				'cnut',
				'b(i|1|!)tch',
				'd(i|1)ck',
				'pussy',
				'asshole',
				'blowjob',
				'c(u|0|o|\\(\\))ck'
			].concat(msg.guild.configs.automod.swearWords);
		} else { swearArray = msg.guild.configs.automod.swearWords; }
		if (!swearArray.length) return;
		if (!new RegExp(swearArray.join('|'), 'im').test(msg.content)) return;
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.delete();
		this.client.finalizers.get('modlogging').run({
			command: this.client.commands.get('warn'),
			guild: msg.guild
		}, [msg.author, 'Swearing with the AntiSwear enabled', null, msg.content]);
	}

	async init() {
		await this.client.commands.get('automod').init();
		const automodSchema = this.client.gateways.guilds.schema.automod;
		if (!automodSchema.antiSwear) await automodSchema.add('antiSwear', { type: 'boolean', default: false, configurable: true });
		if (!automodSchema.globalSwears) await automodSchema.add('globalSwears', { type: 'boolean', default: true, configurable: true });
		if (!automodSchema.swearWords) await automodSchema.add('swearWords', { type: 'string', array: true, default: [], configurable: true });
	}

};
