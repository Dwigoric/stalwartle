const { Command, container } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const { reply } = container;
const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Gets a random FML story.'
        });
    }

    async messageRun(msg) {
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading story...`);
        const $ = cheerio.load(await fetch('http://www.fmylife.com/random').then(res => res.text())); // eslint-disable-line id-length

        const embed = new MessageEmbed()
            .setTitle(`Requested by ${msg.author.tag}`)
            .setAuthor({ name: 'FML Stories' })
            .setColor('RANDOM')
            .setTimestamp()
            .setDescription(`_${$('a.block.text-blue-500').eq(0).text().trim()}\n\n_`)
            .addField('I agree, your life sucks:', $('.vote-btn-count').eq(0).text() || 'N/A', true)
            .addField('You deserved it:', $('.vote-btn-count').eq(1).text() || 'N/A', true);

        if ($('a.block.text-blue-500').length < 5) return reply(msg, '<:akcry:333597917342466048>  ::  Today, something went wrong, so you will have to try again in a few moments. FML again.');

        return reply(msg, { embeds: [embed], content: 'FML story loaded!' });
    }

};
