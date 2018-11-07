const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

	run(message, command) {
		if (this.client.options.owners.includes(message.author.id)) return;
		if (command.cooldown <= 0) return;

		const id = message.levelID;
		const rateLimit = command.cooldowns.get(id) || command.cooldowns.create(id);

		try {
			rateLimit.drip();
		} catch (err) {
			this.client.emit('error', `${message.author.username}[${message.author.id}] has exceeded the RateLimit for ${message.command}`);
		}
	}

};
