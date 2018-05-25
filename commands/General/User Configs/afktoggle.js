const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Toggle whether your AFK status will be removed either when you talk or when you run the `s.afk` command.' });
	}

	async run(msg) {
		const afkSet = msg.author.configs.afktoggle ? ['talk', false] : [`run the \`s.afk\` command`, true];
		msg.send(`<:greenTick:399433439280889858>  ::  Your AFK status will now be removed **when you ${afkSet[0]}**.`);
		msg.author.configs.update('afktoggle', afkSet[1]);
	}

	async init() {
		const userSchema = this.client.gateways.users.schema;
		if (!userSchema.afktoggle) userSchema.add('afktoggle', { type: 'boolean', default: false, configurable: true });
	}

};
