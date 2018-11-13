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
		if (!msg.guild.settings.get('automod.antiSwear')) return;
		if (msg.author.bot && msg.guild.settings.get('automod.ignoreBots')) return;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.settings.get('automod.ignoreMods')) return;
		if (msg.guild.settings.get('automod.filterIgnore.antiSwear').includes(msg.channel.id)) return;
		if (msg.author.equals(this.client.user)) return;

		let swearArray = msg.guild.settings.get('automod.swearWords').map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		if (msg.guild.settings.get('automod.globalSwears')) {
			swearArray = swearArray.concat([
				'raped?',
				'bullshit',
				'nigga',
				'nigger',
				'fuc?ke?r?',
				'cunt',
				'cnut',
				'b(i|1|!)tch',
				'd(i|1)ck',
				'pussy',
				'asshole',
				'blowjob',
				'c(u|0|o|\\(\\))ck',
				'sex',
				'porn'
			]).map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		}
		if (!swearArray.length) return;
		const swearRegex = new RegExp(swearArray.join('|'), 'im');
		if (!swearRegex.test(msg.content)) return;
		if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No swearing allowed, or I'll punish you!`);
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.delete();
		this.client.emit('modlogAction', {
			command: this.client.commands.get('warn'),
			channel: msg.channel,
			guild: msg.guild,
			content: msg.content.length > 900 ? swearRegex.exec(msg.content)[0] : msg.content
		}, msg.author, 'Swearing with the AntiSwear enabled');
	}

};
