const { Monitor } = require('klasa');

const globalSwears = [
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
];

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild) return null;
		if (!msg.guild.settings.get('automod.antiSwear')) return null;
		if (msg.author.bot && msg.guild.settings.get('automod.ignoreBots')) return null;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.settings.get('automod.ignoreMods')) return null;
		if (msg.guild.settings.get('automod.filterIgnore.antiSwear').includes(msg.channel.id)) return null;
		if (msg.author.equals(this.client.user)) return null;

		let swearArray = msg.guild.settings.get('automod.swearWords').map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		if (msg.guild.settings.get('automod.globalSwears')) swearArray = swearArray.concat(globalSwears).map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		const swearRegex = new RegExp(swearArray.join('|'), 'im');
		if (!swearArray.length || !swearRegex.test(msg.content)) return null;
		if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No swearing allowed, or I'll punish you!`);
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.delete();

		const { duration, action } = (await msg.guild.settings.resolve('automod.options.antiSwear'))[0];
		const actionDuration = duration ? await this.client.arguments.get('time').run(`${duration}m`, '', msg) : null;
		switch (action) {
			case 'warn': return this.client.emit('modlogAction', {
				command: this.client.commands.get('warn'),
				channel: msg.channel,
				guild: msg.guild,
				content: msg.content
			}, msg.author, 'Swearing with AntiSwear enabled', null);
			case 'kick': return this.client.commands.get('kick').run(msg, [msg.author, ['Swearing with AntiSwear enabled']]).catch(err => msg.send(err));
			case 'mute': return this.client.commands.get('mute').run(msg, [msg.member, actionDuration, 'Swearing with AntiSwear enabled'], true).catch(err => msg.send(err));
			case 'ban': return this.client.commands.get('ban').run(msg, [msg.author, null, actionDuration, ['Swearing with AntiSwear enabled']], true).catch(err => msg.send(err));
			case 'softban': return this.client.commands.get('softban').run(msg, [msg.author, null, ['Swearing with AntiSwear enabled']]).catch(err => msg.send(err));
		}
		return msg;
	}

};
