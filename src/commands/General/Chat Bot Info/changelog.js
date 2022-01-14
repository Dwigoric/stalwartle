const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['changelogs', 'cl'],
            guarded: true,
            description: 'Gives you my latest changelog to keep you updated!'
        });
    }

    async messageRun(msg) {
        msg.send({ embed: await this.container.client.channels.cache.get(this.container.client.settings.changelogs).messages.fetch({ limit: 1 }).then(messages => messages.first().embeds[0]) });
    }

};
