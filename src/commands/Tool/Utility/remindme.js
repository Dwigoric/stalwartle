const { Subcommand } = require('@sapphire/plugin-subcommands');
const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { Args } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Util: { escapeMarkdown } } = require('discord.js');
const { isValidCron } = require('cron-validator');
const moment = require('moment-timezone');

module.exports = class extends Subcommand {

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
                '\n**Regarding recurring reminders**',
                'If you want recurring reminders (UTC timezone), just replace the reminder duration with a cron format; i.e., if you want to be reminded every hour on Wednesdays, run `s.remindme "0 * * * wed" to drink water`.',
                'To help you format your cron, you can use the website <https://crontab.guru/>.',
                '\nIf you want to force the reminder to the channel, use the `--channel` flag.',
                'Moderators and admins can enable @everyone and @here notifications via the `allowRemindEveryone` setting in the `conf` command.'
            ].join('\n'),
            flags: ['channel'],
            subCommands: ['list', 'remove', { input: 'default', default: true }]
        });
        this.usage = '[list|remove] (DurationUntilReminder:time) [Reminder:...string]';
        this.resolver = Args.make((parameter, argCtx) => {
            if (isValidCron(parameter, { alias: true })) return Args.ok(parameter);
            if (isNaN(new Date(parameter))) return this.container.stores.get('arguments').get('duration').run(parameter, argCtx);

            const { timezone } = this.container.stores.get('gateways').get('userGateway').get(argCtx.message.author.id);
            const customTime = new Date(moment.tz(parameter, timezone).format());
            if (customTime.getTime() <= Date.now()) {
                return Args.error({
                    argument: argCtx.argument,
                    parameter: argCtx.parameter,
                    identifier: 'PastTime',
                    message: 'The given time was in the past.'
                });
            }
            return Args.ok(customTime);
        });
    }

    async default(msg, args) {
        let when = await args.pickResult(this.resolver);
        if (!when.success) {
            if (when.error.identifier === 'PastTime') return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  ${when.error.message} Please check if your timezone is correct using the \`tz\` command.`);
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give a valid time format.`);
        }
        when = when.value;
        const text = await args.rest('string').catch(() => null);

        if (when - new Date() >= 1577880000000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Your reminder cannot be longer than 5 decades!`);

        const reminder = await this.container.tasks.create('Reminder', {
            channel: msg.channel.id,
            user: msg.author.id,
            text,
            forceChannel: Boolean(args.getFlags('channel'))
        }, when instanceof Date ? when.getTime() - Date.now() : { repeated: true, cron: when, customJobOptions: { jobId: Date.now().toString(36) } });

        return reply(msg, [
            `${this.container.constants.EMOTES.tick}  ::  Alright! I've created you a reminder with the ID: \`${reminder.id}\``,
            `You will be reminded of this <t:${((reminder.timestamp + reminder.opts.delay) / 1000).toFixed()}:R>.`,
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
        if (msg.channel.type !== 'DM') return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Removing reminders can only be done on DM channels.`);

        const remList = await this.#remlist(msg);
        if (remList === null) return null;

        const prompter = new MessagePrompter(`Please give me the list number of the reminder you want to delete:\n${remList.list}`, 'message', { timeout: 30000 });
        const prompted = await prompter.run(msg.channel, msg.author);
        const remNum = parseInt(prompted.content, 10);
        prompter.strategy.appliedMessage.delete();
        if (isNaN(remNum)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You didn't give a number!`);

        if (!(await this.container.tasks.list({})).filter(job => job.id === remList[remNum] && job.data.user === msg.author.id).length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I couldn't find a reminder with that number. Are you sure you're giving the correct number?`); // eslint-disable-line max-len
        this.container.tasks.delete(remList[remNum]);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully deleted reminder ID \`${remList[remNum]}\`.`);
    }

    async #remlist(msg) {
        const userRems = (await this.container.tasks.list({})).filter(job => job.name === 'Reminder' && job.data.user === msg.author.id);
        if (!userRems.length) {
            reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You do not have any reminder!`);
            return null;
        }

        const remList = { list: '' };
        userRems.forEach(rem => {
            const remPage = Object.values(userRems).map(rmd => rmd.id).indexOf(rem.id) + 1;
            remList[remPage] = rem.id;
            const text = rem.data.text ? `: ${escapeMarkdown(rem.data.text)}` : '.';
            remList.list += `\`${remPage}\` (\`${rem.id}\`) | You'll be reminded <t:${((rem.timestamp + rem.opts.delay) / 1000).toFixed()}:R>${text}\n`;
        });
        return remList;
    }

};
