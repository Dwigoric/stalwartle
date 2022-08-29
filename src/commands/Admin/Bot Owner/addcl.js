const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const { reply } = require('@sapphire/plugin-editable-commands');

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
        this.usage = '<Content:string>';
    }

    async messageRun(msg, args) {
        const changelog = await args.rest('string').then(str => str.trim()).catch(() => null);
        if (changelog === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the new changelog.`);

        this.container.client.channels.cache.get(this.container.client.settings.changelogs).send({
            embeds: [new MessageEmbed()
                .setTitle(`<a:updating:417233654545383424> ${this.container.client.user.username}'s Changelog`)
                .setDescription(changelog)
                .setTimestamp()]
        });
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully posted changelog!`);
    }

};
