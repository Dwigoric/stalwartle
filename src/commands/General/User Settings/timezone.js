const { Command, container } = require('@sapphire/framework');
const moment = require('moment-timezone');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['tz'],
            description: 'Sets your timezone which is GMT by default.',
            extendedHelp: [
                'The timezone format should be in the [TZ format](http://bit.ly/2ySrZKP).',
                '\nAll time and date from me (except embed timestamps) will be based from your (if you are the command trigerrer) timezone.'
            ].join('\n')
        });
    }

    async messageRun(msg) {
        const timezone = container.stores.get('gateways').get('userGateway').get(msg.author.id, 'timezone');
        const prompted = await msg.prompt(`Current Timezone: \`${timezone}\`\n\n**I'm using the TZ format for timezones. You can view the valid timezones here: <http://bit.ly/2ySrZKP>**\n\nPlease **reply** with the timezone in the correct TZ format, or type \`cancel\` if you don't want me to change your timezone.`); // eslint-disable-line max-len
        if (prompted.content.toLowerCase().split(' ').includes('cancel')) throw `${this.container.constants.EMOTES.tick}  ::  Alright! You don't want to change your timezone.`;
        if (!moment.tz.zone(prompted.content)) throw `${this.container.constants.EMOTES.xmark}  ::  **${prompted.content}** is not a valid timezone!`;
        msg.author.settings.update('timezone', prompted.content);
        return msg.send(`${this.container.constants.EMOTES.tick}  ::  Your timezone has been changed to \`${prompted.content}\`.`);
    }

};
