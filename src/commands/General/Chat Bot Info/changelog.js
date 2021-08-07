const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['changelogs', 'cl'],
			guarded: true,
			description: 'Gives you my latest changelog to keep you updated!'
		});
	}

	async run(msg) {
		msg.send({ embed: await this.client.channels.cache.get(this.client.settings.get('changelogs')).messages.fetch({ limit: 1 }).then(messages => messages.first().embeds[0]) });
	}

};
