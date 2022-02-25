const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['hub'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives you the invite link to my server where you can view the changelog and hang out with us!'
        });
    }

    async messageRun(msg) {
        send(msg, {
            embed: await new MessageEmbed()
                .setColor('RANDOM')
                .setDescription('Please visit my dev server (<https://discord.gg/KDWGvV8>) and go to the questions and support channel so we can give you the utmost support.')
        });
    }

};
