const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Change/update reason for a specific modlog given its ID or message ID.',
			usage: '<MessageIDorModlogID:integer> <Reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [modlogRef, ...reason]) {
		reason = reason.join(this.usageDelim);
		modlogRef = Object.keys(msg.guild.settings.get('modlogs')).some(async chan => await msg.guild.channels.get(chan).messages.fetch(modlogRef)) ? modlogRef.toString() : modlogRef;
		const modlogs = await this.client.providers.default.get('modlogs', msg.guild.id).then(ml => ml.modlogs);
		const modlog = typeof modlogRef === 'number' ? modlogs[modlogRef - 1] : modlogs.filter(log => log.message === modlogRef)[0];
		if (!modlog) throw '<:error:508595005481549846>  ::  You provided an invalid modlog ID or message ID.';
		modlog.reason = reason;
		modlogs.splice(Number(modlog.id) - 1, 1, modlog);
		this.client.providers.default.update('modlogs', msg.guild.id, { modlogs });

		const channel = msg.guild.channels.get(msg.guild.settings.get(`modlogs.${modlog.type}`));
		if ((modlog.message || typeof modlogRef === 'string') && channel) {
			const message = await channel.messages.fetch(modlog.message || modlogRef);
			const embed = message.embeds[0];
			const index = embed.fields.findIndex(field => field.name === 'Reason');
			embed.fields.splice(index >= 0 ? index : 2, index >= 0 ? 1 : 0, { inline: true, name: 'Reason', value: reason });
			message.edit({ embed });
		}
		return msg.send(`<:check:508594899117932544>  ::  Successfully updated modlog #\`${modlog.id}\`'s reason.`);
	}

};
