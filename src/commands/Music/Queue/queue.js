const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { LazyPaginatedMessage } = require('@sapphire/discord.js-utilities');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Timestamp } = require('@sapphire/time-utilities');
const { chunk } = require('@sapphire/utilities');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['q'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
            description: 'Shows the queue for the server.'
        });
    }

    async messageRun(msg) {
        const { queue } = JSON.parse(JSON.stringify(this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id)));
        if (!queue.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the queue yet! Add one with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\`.`);
        const message = await msg.reply(`${this.container.constants.EMOTES.loading}  ::  Loading the music queue...`);
        const np = queue[0];
        const npStatus = msg.guild.me.voice.channel ?
            this.container.lavacord.players.get(msg.guild.id).paused ?
                '⏸' :
                '▶' :
            '⤴ Up Next:';
        const display = new LazyPaginatedMessage({
            template: {
                content: `${this.container.constants.EMOTES.tick}  ::  Music queue loaded!`,
                embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setAuthor({ name: `Server Music Queue: ${msg.guild.name}`, iconURL: msg.guild.iconURL({ dynamic: true }) })
                    .setTitle('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
                    .setTimestamp()]
            }
        });

        queue.shift();
        let duration = np.info.isStream ? 0 : np.info.length;

        await Promise.all((queue.length ? chunk(queue, 10) : [np]).map(async (music10, tenPower) => [`${npStatus} [**${escapeMarkdown(np.info.title)}** by ${escapeMarkdown(np.info.author)}](${np.info.uri}) \`${np.info.isStream ? 'Livestream' : new Timestamp(`${np.info.length >= 86400000 ? 'DD:' : ''}${np.info.length >= 3600000 ? 'HH:' : ''}mm:ss`).display(np.info.length)}\` - ${await this.container.client.users.fetch(np.requester).then(usr => usr.tag)}\n`].concat(queue.length ? await Promise.all(music10.map(async (music, onePower) => { // eslint-disable-line max-len
            const { length } = music.info;
            duration += music.info.isStream ? 0 : length;
            return `\`${(tenPower * 10) + (onePower + 1)}\`. [**${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)}](${music.info.uri}) \`${music.info.isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\` - ${await this.container.client.users.fetch(music.requester).then(usr => usr.tag)}`; // eslint-disable-line max-len
        })) : 'No upcoming tracks.'))).then(musicList => musicList.forEach(queue10 => display.addPageEmbed(template => template.setDescription(queue10.join('\n')))));

        display.template.embeds[0].setFooter({ text: [
            `[${queue.length} Queue Entr${queue.length === 1 ? 'y' : 'ies'}]`,
            `Queue Duration: ${new Timestamp(`${duration >= 86400000 ? 'DD[d]' : ''}${duration >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(duration)}`
        ].join(' - ') });

        return display.run(message, msg.author).catch(err => this.container.logger.error(err));
    }

};
