const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'This command is used to give suggestions for the bot.',
            usage: '<Suggestion:string>',
            extendedHelp: [
                'Suggestions include basically anything except anything silly AND suggesting something against the [Discord Guidelines](https://discordapp.com/guidelines).',
                '**These will lead to a ban from the bot.**',
                'Your suggestion is sent to my dev server that is heavily guarded by a samurai.',
                "My high lords will look into your suggestion as soon as they can and may send you a DM after it's checked."
            ].join('\n')
        });
    }

    async messageRun(msg, args) {
        let suggestion = await args.restResult('string');
        if (!suggestion.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide your suggestion for the bot!`);
        suggestion = suggestion.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Sending suggestion...`);

        this.container.client.channels.cache.get(this.container.client.settings.suggestions.reports).send([
            `💡  ::  Suggestion by **${msg.author.tag}** | ${msg.author.id}`,
            `\t\t\tServer: ${msg.guild ? `${msg.guild.name} | ${msg.guild.id}` : 'None (Direct Messages)'}`,
            `\`\`\`${suggestion}\`\`\``
        ].join('\n'), { files: msg.attachments.map(a => a.url), disableMentions: 'everyone' });

        return reply(msg, [
            `${this.container.constants.EMOTES.tick}  ::  I've successfully submitted your suggestion! Thank you for helping to make this bot better. 💖\n`,
            '***Please make sure I can DM (privacy settings) you so you will be updated about your suggestion.***'
        ].join('\n'));
    }

};
