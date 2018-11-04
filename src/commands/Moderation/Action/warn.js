const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			runIn: ['text'],
			description: 'Warns a mentioned user.',
			usage: '<Member:member> [Reason:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [member, ...reason]) {
		if (member.id === msg.author.id) throw 'Why would you warn yourself?';
		if (member.id === this.client.user.id) throw 'Have I done something wrong?';

		reason = reason.length > 0 ? reason.join(this.usageDelim) : null;
		msg.channel.send(`<:check:508590521342623764>  ::  **${member.user.tag}** (\`${member.id}\`) has been warned.${reason ? ` **Reason**: ${reason}` : ''}`);
		return this.client.emit('modlogAction', msg, member.user, reason);
	}

};
