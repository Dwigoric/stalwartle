const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const moment = require('moment-timezone');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['tz'],
            description: 'Sets your timezone which is GMT by default.',
            detailedDescription: [
                'The timezone format should be in the [TZ format](http://bit.ly/2ySrZKP).',
                '\nAll time and date from me (except embed timestamps) will be based from your (if you are the command trigerrer) timezone.'
            ].join('\n')
        });
    }

    async messageRun(msg) {
        const timezone = container.stores.get('gateways').get('userGateway').get(msg.author.id, 'timezone');
        const handler = new MessagePrompter(`Current Timezone: \`${timezone}\`\n\n**I'm using the TZ format for timezones. You can view the valid timezones here: <http://bit.ly/2ySrZKP>**\n\nPlease **reply** with the timezone in the correct TZ format, or type \`cancel\` if you don't want me to change your timezone.`, 'message', { timeout: 30000 }); // eslint-disable-line max-len
        const prompted = await handler.run(msg.channel, msg.author).catch(() => ({ content: 'cancel' }));
        handler.strategy.appliedMessage.delete();

        if (prompted.content.toLowerCase().split(' ').includes('cancel')) return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Alright! You don't want to change your timezone.`);
        if (!moment.tz.zone(prompted.content)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  **${prompted.content}** is not a valid timezone!`);
        container.stores.get('gateways').get('userGateway').update(msg.author.id, 'timezone', prompted.content);
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Your timezone has been changed to \`${prompted.content}\`.`);
    }

};
