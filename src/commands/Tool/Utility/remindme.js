const { Command, Duration } = require('klasa');
const { Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['remind', 'reminder'],
			description: 'Schedules a reminder for you.',
			usage: '[list|remove] (DurationUntilReminder:time) [Reminder:string] [...]',
			extendedHelp: [
				'e.g. `s.remindme 1m to get in the car, buy stuff, do stuff`',
				"The subcommands `list` and `remove` are optional. If you want to add a reminder, simply don't use any subcommand.",
				'**If you want daily, weekly, monthly or annual reminders, just replace the reminder duration with `daily`, `annually` etc., e.g. `s.remindme daily to eat cake`**',
				'\n**Hourlies** `hourly` → At 0 minute past every hour',
				'**Dailies** `daily` → At 00:00',
				'**Weeklies** `weekly` → At 00:00 every Saturday',
				'**Monthlies** `monthly` → At 00:00 every first day of the month',
				'**Annuals** `annually` → At 00:00 in January 1',
				'All of which are in GMT timezone.',
				'\nIf you want to force the reminder to the channel, use the `--channel` flag.'
			].join('\n'),
			usageDelim: ' ',
			subcommands: true
		});

		this
			.createCustomResolver('time', (arg, possible, msg, [action]) => {
				if (['list', 'remove'].includes(action)) return undefined;
				if (!arg) throw '<:crossmark:508590460688924693>  ::  Please provide the duration (e.g. 2d3h4m) of the reminder.';
				if (arg === 'annually') return '0 0 1 1 *';
				else if (arg === 'monthly') return '0 0 1 * *';
				else if (arg === 'weekly') return '0 0 * * 6';
				else if (arg === 'daily') return '0 0 * * *';
				else if (arg === 'hourly') return '0 */1 * * *';
				else return this.client.arguments.get('time').run(arg, possible, msg);
			});
	}

	async run(msg, [when, ...text]) {
		if (when - new Date() >= 94672801000) throw '<:crossmark:508590460688924693>  ::  Your reminder cannot be longer than 3 years!';
		const reminder = await this.client.schedule.create('reminder', when, {
			data: {
				channel: msg.channel.id,
				user: msg.author.id,
				text: text.join(this.usageDelim),
				forceChannel: Object.keys(msg.flags).includes('channel')
			}
		});
		msg.send([
			`<:check:508590521342623764>  ::  Alright! I created you a reminder with the ID: \`${reminder.id}\``,
			`You will be reminded of this in ${Duration.toNow(reminder.time)}.`,
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
		if (isNaN(remNum)) throw "<:crossmark:508590460688924693>  ::  You didn't give a number! :3";
		if (!this.client.schedule.tasks.filter(tk => tk.id === remList[remNum] && tk.data.user === msg.author.id)[0]) throw "<:crossmark:508590460688924693>  ::  Sorry! I couldn't find a reminder with that number. Are you sure you're giving the correct number?"; // eslint-disable-line max-len
		this.client.schedule.delete(remList[remNum]);
		return msg.send(`<:check:508590521342623764>  ::  Successfully deleted reminder ID \`${remList[remNum]}\`.`);
	}

	async remlist(msg) {
		const userRems = this.client.schedule.tasks.filter(tk => tk.taskName === 'reminder' && tk.data.user === msg.author.id);
		if (!userRems.length) throw '<:crossmark:508590460688924693>  ::  You do not have any reminder!';
		const remList = { list: '' };
		userRems.forEach(rem => {
			const remPage = Object.values(userRems).map(rmd => rmd.id).indexOf(rem.id) + 1;
			remList[remPage] = rem.id;
			const text = rem.data.text ? `: ${escapeMarkdown(rem.data.text)}` : '.';
			remList.list += `\`${remPage}\` (\`${rem.id}\`) | You'll be reminded in **${Duration.toNow(rem.time)}**${text}\n`;
		});
		return remList;
	}

};
