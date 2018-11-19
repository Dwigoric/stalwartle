const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			description: 'Shuffles the server music queue.'
		});
	}

	async run(msg) {
		const queue = (await this.client.providers.default.get('music', msg.guild.id).then(ms => ms.queue)).slice(1);
		if (!queue.length) throw '<:error:508595005481549846>  ::  There are no up-next songs... I have nothing to shuffle!';
		this.client.providers.default.update('music', msg.guild.id, {
			queue: (() => {
				let currentIndex = queue.length, tempVal, randomIndex;
				while (currentIndex) {
					// Pick an element...
					randomIndex = Math.floor(Math.random() * currentIndex);
					currentIndex--;
					// Then swap it with current element
					tempVal = queue[currentIndex];
					queue[currentIndex] = queue[randomIndex];
					queue[randomIndex] = tempVal;
				}
				return queue;
			})()
		});
		msg.send(`<:check:508594899117932544>  ::  Successfully shuffled the queue. Check it out with \`${msg.guildSettings.get('prefix')}queue\``);
	}

};
