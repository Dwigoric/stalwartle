const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Change/update reason for a specific modlog given its ID.',
			usage: '<ModlogID:integer> <Reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [modlogID, ...reason]) {
		reason = reason.join(this.usageDelim);
		const modlogs = this.client.gateways.modlogs.get(msg.guild.id, true).get('modlogs');
		const modlog = modlogs[modlogID - 1];
		if (!modlog) throw '<:error:508595005481549846>  ::  You provided an invalid modlog ID.';
		modlog.reason = reason;
		modlogs.splice(Number(modlog.id) - 1, 1, modlog);
		this.client.gateways.modlogs.get(msg.guild.id, true).update('modlogs', modlogs);

		const channel = msg.guild.channels.cache.get(msg.guild.settings.get(`modlogs.${modlog.type}`));
		if (!modlog.message) throw `⚠  ::  I've updated the modlog in \`${msg.guild.settings.get('prefix')}modlogs\`, however the one sent in the modlog channel is not edited.`;
		let message;
		if (channel) message = await channel.messages.fetch(modlog.message).catch(() => { throw `⚠  ::  I've updated the modlog in \`${msg.guild.settings.get('prefix')}modlogs\`, however either the message has been deleted or the modlog message is not in ${channel}.`; }); // eslint-disable-line max-len
		const embed = message.embeds[0];
		const index = embed.fields.findIndex(field => field.name === 'Reason');
		embed.fields.splice(index >= 0 ? index : 2, index >= 0 ? 1 : 0, { inline: true, name: 'Reason', value: reason });
		message.edit({ embed });
		return msg.send(`<:check:508594899117932544>  ::  Successfully updated modlog #\`${modlog.id}\`'s reason.`);
	}

};
