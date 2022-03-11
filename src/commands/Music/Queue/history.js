const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const { LazyPaginatedMessage, MessagePrompter } = require('@sapphire/discord.js-utilities');
const { chunk } = require('@sapphire/utilities');
const { Timestamp } = require('@sapphire/time-utilities');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
            description: 'Shows the songs played in the server in the last 24 hours.',
            detailedDescription: [
                'Export the history by using `s.history export`, clear it with `s.history clear`',
                'To play songs on incognito, simply add the `--incognito` flag **when using the `s.play` command**.'
            ].join('\n'),
            subCommands: ['export', 'clear', { input: 'default', default: true }]
        });
    }

    async default(msg) {
        if (this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'donation') < 3) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! This feature is limited to servers which have donated $3 or more.`);
        const { history } = await this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!history.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no songs in the history yet! Songs you play are stored in the history within a day.`);
        const message = await msg.reply(`${this.container.constants.EMOTES.loading}  ::  Loading the music history...`);
        const display = new LazyPaginatedMessage({
            template: {
                content: `${this.container.constants.EMOTES.tick}  ::  Music history loaded!`,
                embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setAuthor({ name: `Server Music History: ${msg.guild.name}`, iconURL: msg.guild.iconURL({ dynamic: true }) })
                    .setTitle('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
                    .setTimestamp()]
            }
        });

        let duration = 0;
        await Promise.all(chunk(history, 10).map(async (music10, tenPower) => await Promise.all(music10.map(async (music, onePower) => {
            const { length } = music.info;
            duration += music.info.isStream ? 0 : length;
            return `\`${(tenPower * 10) + (onePower + 1)}\`. [**${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)}](${music.info.uri}) \`${music.info.isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\` - ${await this.container.client.users.fetch(music.requester).then(usr => usr.tag)} (${moment(music.timestamp).fromNow()})`; // eslint-disable-line max-len
        })))).then(hist => hist.forEach(hist10 => display.addPageEmbed(template => template.setDescription(hist10.join('\n')))));

        display.template.embeds[0].setFooter({ text: [
            `[${history.length} History Item${history.length === 1 ? '' : 's'}]`,
            `History Duration: ${new Timestamp(`${duration >= 86400000 ? 'DD[d]' : ''}${duration >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(duration)}`
        ].join(' - ') });

        return display.run(message, msg.author);
    }

    async export(msg) {
        const { history } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!history.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The history is empty. Songs you play are stored in the history within a day.`);

        const prompter = new MessagePrompter('📜  ::  Should the history be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer. Otherwise, reply `none` to cancel.', 'message');
        let choice;
        do {
            if (prompter.strategy.appliedMessage) prompter.strategy.appliedMessage.delete();
            choice = await prompter.run(msg.channel, msg.author).catch(() => ({ content: 'none' }));
        } while (!['file', 'haste', 'hastebin', 'none'].includes(choice.content));
        prompter.strategy.appliedMessage.delete();

        switch (choice.content) {
            case 'file': {
                if (!msg.channel.permissionsFor(this.container.client.user).has(['SEND_MESSAGES', 'ATTACH_FILES'])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I do not have the permissions to attach files to this channel.`);
                return reply(msg, { files: [{ attachment: Buffer.from(history.map(track => track.info.uri).join('\r\n')), name: 'output.txt' }], content: `${this.container.constants.EMOTES.tick}  ::  Exported the history as file.` });
            }
            case 'haste':
            case 'hastebin': {
                const { key } = await fetch('https://www.toptal.com/developers/hastebin/documents', {
                    method: 'POST',
                    body: history.map(track => track.info.uri).join('\r\n')
                }).then(res => res.json()).catch(() => ({ key: null }));
                if (key === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! An unknown error occurred.`);
                return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Exported the history to hastebin: <https://www.toptal.com/developers/hastebin/${key}.stalwartle>`);
            }
        }
        return null;
    }

    async clear(msg) {
        if (!(await this.container.stores.get('preconditions').get('DJOnly').run(msg)).success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Only DJs can clear the history!`);
        await this.container.stores.get('gateways').get('musicGateway').reset(msg.guild.id, 'history');
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully cleared the music history for this server.`);
    }

};
