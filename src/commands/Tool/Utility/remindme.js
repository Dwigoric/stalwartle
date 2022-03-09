const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { Args } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Util: { escapeMarkdown } } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['rem', 'remind', 'reminder'],
            description: 'Schedules a reminder for you. See extended help for time formats.',
            detailedDescription: [
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
            flags: ['channel'],
            subCommands: ['list', 'remove', { input: 'default', default: true }]
        });

        this.resolver = Args.make((parameter, argCtx) => {
            if (moment(parameter, true).isValid()) {
                const { timezone } = this.container.stores.get('gateways').get('userGateway').get(argCtx.message.author.id);
                const customTime = Number(moment.tz(parameter, timezone).format('x'));
                if (customTime <= Date.now()) {
                    return Args.error({
                        argument: argCtx.argument,
                        parameter: argCtx.parameter,
                        identifier: 'PastTime',
                        message: 'The given time was in the past.'
                    });
                }
                return Args.ok(new Date(customTime));
            }

            const cron = {
                annually: '0 0 1 1 *',
                monthly: '0 0 1 * *',
                weekly: '0 0 * * 6',
                daily: '0 0 * * *',
                hourly: '0 */1 * * *'
            };

            if (parameter in cron) return Args.ok(cron[parameter]);
            else return this.container.stores.get('arguments').get('duration').run(parameter, argCtx);
        });
    }

    async default(msg, args) {
        let when = await args.pickResult(this.resolver);
        if (!when.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give a valid time format.`);
        when = when.value;
        const text = await args.rest('string').catch(() => null);

        if (when - new Date() >= 1577880000000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Your reminder cannot be longer than 5 decades!`);

        const reminder = await this.container.tasks.create('Reminder', {
            channel: msg.channel.id,
            user: msg.author.id,
            text,
            forceChannel: Boolean(args.getFlags('channel'))
        }, when instanceof Date ? when.getTime() - Date.now() : when);

        return reply(msg, [
            `${this.container.constants.EMOTES.tick}  ::  Alright! I've created you a reminder with the ID: \`${reminder.id}\``,
            `You will be reminded of this in approximately ${moment(reminder.time).fromNow(true)}.`,
            reminder.data.forceChannel ?
                'The people of this channel will be reminded.' :
                "I will first try to remind you in DMs. If I can't send you one, I will then try to remind you in the channel you run this command."
        ].join('\n'));
    }

    async list(msg) {
        const remList = await this.#remlist(msg);
        if (remList === null) return null;

        return msg.author.send(`Here is a list of your reminders:\n${remList.list}`)
            .then(() => { if (msg.channel.type !== 'DM') reply(msg, `${this.container.constants.EMOTES.tick}  ::  The list of your reminders has been sent to your DMs.`); })
            .catch(() => reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I could not send the list of your reminders to your DMs. Please check your privacy settings and try again.`));
    }

    async remove(msg) {
        const remList = await this.#remlist(msg);
        if (remList === null) return null;

        const prompter = new MessagePrompter(`Please give me the list number of the reminder you want to delete:\n${remList.list}`, 'message');
        const prompted = await prompter.run(msg.channel, msg.author);
        const remNum = parseInt(prompted.content);
        prompter.strategy.appliedMessage.delete();
        if (isNaN(remNum)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You didn't give a number!`);

        if (!(await this.container.tasks.list({})).filter(job => job.id === remList[remNum] && job.data.payload.user === msg.author.id).length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I couldn't find a reminder with that number. Are you sure you're giving the correct number?`); // eslint-disable-line max-len
        this.container.tasks.delete(remList[remNum]);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully deleted reminder ID \`${remList[remNum]}\`.`);
    }

    async #remlist(msg) {
        const userRems = (await this.container.tasks.list({})).filter(job => job.data.task === 'Reminder' && job.data.payload.user === msg.author.id);
        if (!userRems.length) {
            reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You do not have any reminder!`);
            return null;
        }

        const remList = { list: '' };
        userRems.forEach(rem => {
            const remPage = Object.values(userRems).map(rmd => rmd.id).indexOf(rem.id) + 1;
            remList[remPage] = rem.id;
            const text = rem.data.text ? `: ${escapeMarkdown(rem.data.text)}` : '.';
            remList.list += `\`${remPage}\` (\`${rem.id}\`) | You'll be reminded in approximately **${moment(rem.time).fromNow(true)}**${text}\n`;
        });
        return remList;
    }

};
