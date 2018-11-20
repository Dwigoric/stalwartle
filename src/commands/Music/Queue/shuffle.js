const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			description: 'Shuffles the server music queue.'
		});
	}

	async run(msg) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		const upNext = queue.slice(1);
		if (!queue.length) throw `<:error:508595005481549846>  ::  There are no songs in the queue. Add one with \`${msg.guildSettings.get('prefix')}play\``;
		if (!upNext.length) throw '<:error:508595005481549846>  ::  There are no up-next songs... I have nothing to shuffle!';
		this.client.providers.default.update('music', msg.guild.id, {
			queue: [queue[0]].concat((() => {
				for (let current = upNext.length - 1; current > 0; current--) {
					const random = Math.floor(Math.random() * (current + 1));
					const temp = upNext[current];
					upNext[current] = upNext[random];
					upNext[random] = temp;
				}
				return upNext;
			})())
		});
		msg.send(`<:check:508594899117932544>  ::  Successfully shuffled the queue. Check it out with \`${msg.guildSettings.get('prefix')}queue\``);
	}

};
