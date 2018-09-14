const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['changelogs', 'cl'],
			guarded: true,
			description: 'Gives you my latest changelog to keep you updated!'
		});
	}

	async run(msg) {
		msg.send({ embed: await this.client.channels.get('445823150626832386').messages.fetch({ limit: 1 }).then(messages => messages.first().embeds[0]) });
	}

};
