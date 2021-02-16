const { Command, Duration } = require('klasa');
const { Util: { escapeMarkdown } } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rem', 'remind', 'reminder'],
			description: 'Schedules a reminder for you. See extended help for time formats.',
			usage: '[list|remove] (DurationUntilReminder:time) [Reminder:string] [...]',
			extendedHelp: [
				'e.g. `s.remindme 1m to get in the car, buy stuff, do stuff`',
				// eslint-disable-next-line max-len
				'To be reminded in specific times, replace the subcommands with this format: `YYYY-MM-DD HH:mm`. Please be noted that this respects your custom timezone, if you set one.',
				'If you want to set a reminder on 29 Feb 2020 at 1:00 PM, you would run `s.rem "2020-02-29 13:00" do something`. You can set the timezone for each reminder as well.',
				'\nThe subcommands `list` and `remove` are used to list or remove reminders.',
				'**If you want recurring reminders (GMT timezone), just replace the reminder duration with `daily`, `annually` etc., e.g. `s.remindme daily to drink water`**',
				'\n**Hourlies** `hourly` → At 0 minute past every hour',
				'**Dailies** `daily` → At 00:00',
				'**Weeklies** `weekly` → At 00:00 every Saturday',
				'**Monthlies** `monthly` → At 00:00 every first day of the month',
				'**Annuals** `annually` → At 00:00 in January 1',
				'\nIf you want to force the reminder to the channel, use the `--channel` flag.'
			].join('\n'),
			usageDelim: ' ',
			quotedStringSupport: true,
			subcommands: true
		});

		this
			.createCustomResolver('time', (arg, possible, msg, [action]) => {
				if (['list', 'remove'].includes(action)) return undefined;
				if (!arg) throw `${this.client.constants.EMOTES.xmark}  ::  Please provide the duration (e.g. 2d3h4m) or the specific time of the reminder.`;

				if (moment(arg).isValid()) {
					const customTime = Number(moment.tz(arg, msg.author.settings.get('timezone')).format('x'));
					if (customTime <= Date.now()) throw `${this.client.constants.EMOTES.xmark}  ::  I cannot travel back in time!`;
					return new Date(customTime);
				}

				if (arg === 'annually') return '0 0 1 1 *';
				else if (arg === 'monthly') return '0 0 1 * *';
				else if (arg === 'weekly') return '0 0 * * 6';
				else if (arg === 'daily') return '0 0 * * *';
				else if (arg === 'hourly') return '0 */1 * * *';
				else return this.client.arguments.get('time').run(arg, possible, msg);
			});
	}

	async run(msg, [when, ...text]) {
		if (when - new Date() >= 86400000000) throw `${this.client.constants.EMOTES.xmark}  ::  Your reminder cannot be longer than 1000 days!`;

		const reminder = await this.client.schedule.create('reminder', when, {
			data: {
				channel: msg.channel.id,
				user: msg.author.id,
				text: text.join(this.usageDelim),
				forceChannel: 'channel' in msg.flagArgs
			}
		});

		msg.send([
			`${this.client.constants.EMOTES.tick}  ::  Alright! I've created you a reminder with the ID: \`${reminder.id}\``,
			`You will be reminded of this in approximately ${Duration.toNow(reminder.time)}.`,
			reminder.data.forceChannel ?
				'The people of this channel will be reminded.' :
				"I will first try to remind you in DMs. If I can't send you one, I will then try to remind you in the channel you run this command."
		].join('\n'));
	}

	async list(msg) {
		const remList = await this.remlist(msg);
		return msg.send(`Here is a list of your reminders:\n${remList.list}`);
	}

	async remove(msg) {
		const remList = await this.remlist(msg);
		const prompted = await msg.prompt(`Please give me the list number of the reminder you want to delete:\n${remList.list}`);
		const remNum = Number(prompted.content);
		if (isNaN(remNum)) throw `${this.client.constants.EMOTES.xmark}  ::  You didn't give a number!`;
		if (!this.client.schedule.tasks.filter(tk => tk.id === remList[remNum] && tk.data.user === msg.author.id)[0]) throw `${this.client.constants.EMOTES.xmark}  ::  Sorry! I couldn't find a reminder with that number. Are you sure you're giving the correct number?`; // eslint-disable-line max-len
		this.client.schedule.delete(remList[remNum]);
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully deleted reminder ID \`${remList[remNum]}\`.`);
	}

	async remlist(msg) {
		const userRems = this.client.schedule.tasks.filter(tk => tk.taskName === 'reminder' && tk.data.user === msg.author.id);
		if (!userRems.length) throw `${this.client.constants.EMOTES.xmark}  ::  You do not have any reminder!`;
		const remList = { list: '' };
		userRems.forEach(rem => {
			const remPage = Object.values(userRems).map(rmd => rmd.id).indexOf(rem.id) + 1;
			remList[remPage] = rem.id;
			const text = rem.data.text ? `: ${escapeMarkdown(rem.data.text)}` : '.';
			remList.list += `\`${remPage}\` (\`${rem.id}\`) | You'll be reminded in approximately **${Duration.toNow(rem.time)}**${text}\n`;
		});
		return remList;
	}

};
