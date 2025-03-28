const { Command, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'This command is used to report bugs.',
            detailedDescription: 'Those who submit silly bug reports will be banned from the bot. Your bug report is escorted by a samurai to my dev server where my developers can fix the bug as soon as they can.' // eslint-disable-line max-len
        });
        this.usage = '<BugReport:string>';
        this.guarded = true;
    }

    async messageRun(msg, args) {
        let params = await args.restResult('string');
        if (!params.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the bug report!`);
        params = params.value;

        const server = msg.guild ? `${msg.guild.name} | ${msg.guild.id}` : 'None (Direct Messages)';
        this.container.client.channels.cache.get(this.container.client.settings.bugs.reports).send([
            `🐛  ::  Bug Report by **${msg.author.tag}** | ${msg.author.id}`,
            `\t\t\tServer: ${server}`,
            `\`\`\`${params}\`\`\``
        ].join('\n'), { files: msg.attachments.map(a => ({ attachment: a.url })), allowedMentions: { parse: [] } });

        return reply(msg, [
            `${this.container.constants.EMOTES.tick}  ::  I've successfully submitted your bug report! Thank you for helping to make this bot better. 💖\n`,
            '***Please make sure I can DM (privacy settings) you so you will be updated about your report.***'
        ].join('\n'));
    }

};
