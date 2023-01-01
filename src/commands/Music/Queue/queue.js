const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { LazyPaginatedMessage } = require('@sapphire/discord.js-utilities');
const { reply } = container;
const { Timestamp } = require('@sapphire/timestamp');
const { chunk } = require('@sapphire/utilities');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['q'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Shows the queue for the server.'
        });
    }

    async messageRun(msg) {
        const { queue } = JSON.parse(JSON.stringify(this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id)));
        if (!queue.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the queue yet! Add one with \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\`.`);
        const message = await msg.reply(`${this.container.constants.EMOTES.loading}  ::  Loading the music queue...`);
        const np = queue[0];
        const npStatus = this.container.erela.players.has(msg.guild.id) ?
            this.container.erela.players.get(msg.guild.id).paused ?
                '⏸' :
                '▶' :
            '⤴ Up Next:';
        const display = new LazyPaginatedMessage({
            template: {
                content: `${this.container.constants.EMOTES.tick}  ::  Music queue loaded!`,
                embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setAuthor({ name: `Server Music Queue: ${msg.guild.name}`, iconURL: msg.guild.iconURL({ dynamic: true }) })
                    .setTitle('Use the buttons to navigate the pages.')
                    .setTimestamp()]
            }
        });

        queue.shift();
        let length = np.isStream ? 0 : np.duration;

        await Promise.all((queue.length ? chunk(queue, 10) : [np]).map(async (music10, tenPower) =>
            [
                [
                    `${npStatus} [**${escapeMarkdown(np.title)}** by ${escapeMarkdown(np.author)}](${np.uri})`,
                    `\`${np.isStream ? 'Livestream' : new Timestamp(`${np.duration >= 86400000 ? 'DD:' : ''}${np.duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(np.duration)}\``,
                    `- ${await this.container.client.users.fetch(np.requester).then(usr => usr.tag)}\n`
                ].join(' ')
            ].concat(queue.length ? await Promise.all(music10.map(async (music, onePower) => {
                length += music.isStream ? 0 : music.duration;
                return [
                    `\`${(tenPower * 10) + (onePower + 1)}\`.`,
                    `[**${escapeMarkdown(music.title)}** by ${escapeMarkdown(music.author)}](${music.uri})`,
                    `\`${music.isStream ? 'Livestream' : new Timestamp(`${music.duration >= 86400000 ? 'DD:' : ''}${music.duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(music.duration)}\``,
                    `- ${await this.container.client.users.fetch(music.requester, { cache: false }).then(usr => usr.tag)}`
                ].join(' ');
            })) : 'No upcoming tracks.')
        )).then(musicList => musicList.forEach(queue10 => display.addPageEmbed(template => template.setDescription(queue10.join('\n')))));

        display.template.embeds[0].setFooter({ text: [
            `[${queue.length} Queue Entr${queue.length === 1 ? 'y' : 'ies'}]`,
            `Queue Duration: ${new Timestamp(`${length >= 86400000 ? 'DD[d]' : ''}${length >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(length)}`
        ].join(' - ') });

        return display.run(message, msg.author).catch(err => this.container.logger.error(err));
    }

};
