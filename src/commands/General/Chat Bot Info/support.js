const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['hub'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives you the invite link to my server where you can view the changelog and hang out with us!'
        });
        this.guarded = true;
    }

    // skipcq: JS-0105
    async messageRun(msg) {
        reply(msg, {
            embeds: [await new MessageEmbed()
                .setColor('RANDOM')
                .setDescription('Please visit my dev server (<https://discord.gg/KDWGvV8>) and go to the questions and support channel so we can give you the utmost support.')]
        });
    }

};
