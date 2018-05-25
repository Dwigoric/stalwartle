const { Command } = require('klasa');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Sets your timezone which is GMT by default.',
			extendedHelp: [
				'The timezone format should be in the [TZ format](http://bit.ly/2ySrZKP).',
				'\nAll time and date from me (except embed timestamps) will be based from your (if you are the command trigerrer) timezone.'
			].join('\n')
		});
	}

	async run(msg) {
		const { timezone } = msg.author.configs;
		msg.prompt(`Current Timezone: \`${timezone}\`\n\n**I'm using the TZ format for timezones. You can view the valid timezones here: <http://bit.ly/2ySrZKP>**\n\nPlease give me the timezone in the correct TZ format, or type \`cancel\` if you don't want me to change your timezone.`).then(prompted => { // eslint-disable-line max-len
			if (prompted.content.toLowerCase().split(' ').includes('cancel')) throw "Alright! You don't want to change your timezone.";
			if (!moment.tz.zone(prompted.content)) throw `<:redTick:399433440975519754>  ::  **${prompted.content}** is not a valid timezone!`;
			msg.author.configs.update('timezone', prompted.content);
			msg.send(`<:greenTick:399433439280889858>  ::  Your timezone has been changed to \`${prompted.content}\`.`);
		});
	}

	async init() {
		const userSchema = this.client.gateways.users.schema;
		if (!userSchema.timezone) userSchema.add('timezone', { type: 'string', default: 'GMT', configurable: false });
	}

};
