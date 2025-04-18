const { Command, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['changelogs', 'cl'],
            description: 'Gives you my latest changelog to keep you updated!'
        });
        this.guarded = true;
    }

    async messageRun(msg) {
        reply(msg, { embed: await this.container.client.channels.cache.get(this.container.client.settings.changelogs).messages.fetch({ limit: 1 }).then(messages => messages.first().embeds[0]) });
    }

};
