const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const { send } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['addchangelog'],
            cooldownDelay: 5000,
            cooldownLimit: 3,
            description: 'Posts a changelog in the changelog channel on the support server.',
            preconditions: ['DevsOnly'],
            requiredClientPermissions: ['EMBED_LINKS']
        });
    }

    async messageRun(msg, args) {
        this.container.client.channels.cache.get(this.container.client.settings.changelogs).send({
            embed: new MessageEmbed()
                .setTitle(`<a:updating:417233654545383424> ${this.container.client.user.username}'s Changelog`)
                .setDescription(await args.rest('string'))
                .setTimestamp()
        });
        send(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully posted changelog!`);
    }

};
