const { Subcommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { LazyPaginatedMessage } = require('@sapphire/discord.js-utilities');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const { regExpEsc, chunk } = require('@sapphire/utilities');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Subcommand {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['MANAGE_ROLES'],
            description: 'Gives/takes a self-assignable role (selfrole).',
            detailedDescription: 'You can setup selfroles via `s.conf set selfroles`',
            subcommands: [
                { name: 'list', messageRun: 'list' },
                { name: 'default', messageRun: 'default', default: true }
            ]
        });
        this.usage = '[list],(SelfAssignableRole:string)';
    }

    async default(msg, args) {
        const { selfroles } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        if (!selfroles.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Selfrole is not yet implemented in this server.`);

        let sar = await args.restResult('string');
        if (!sar.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the name of the selfrole you want to assign yourself.`);
        sar = sar.value;

        const role = selfroles.map(_sar => msg.guild.roles.cache.get(_sar)).find(rl => new RegExp(regExpEsc(sar), 'i').test(rl.name));
        if (!role) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Invalid selfrole. Check all available selfroles in this server by using \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}rank list\`.`); // eslint-disable-line max-len

        if (role.position > msg.guild.me.roles.highest.position) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  **${escapeMarkdown(role.name)}**'s position is higher than me.`);
        if (msg.member.roles.cache.has(role.id)) {
            await msg.member.roles.remove(role, `[Selfrole Remove] Selfrole feature of ${this.container.client.user.username}`);
            return reply(msg, {
                allowedMentions: { parse: [] },
                content: `${this.container.constants.EMOTES.tick}  ::  **${escapeMarkdown(role.name)}** has been taken from **${escapeMarkdown(msg.author)}** via selfrole.`
            });
        }

        await msg.member.roles.add(role, `[Selfrole Add] Selfrole feature of ${this.container.client.user.username}`);
        return reply(msg, {
            allowedMentions: { parse: [] },
            content: `${this.container.constants.EMOTES.tick}  ::  **${msg.author}** has been given **${escapeMarkdown(role.name)}** via selfrole.`
        });
    }

    async list(msg) {
        if (!msg.channel.permissionsFor(this.container.client.user).has('EMBED_LINKS')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I need to be able to **Embed Links** (permissions).`); // eslint-disable-line max-len

        const { selfroles } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        if (!selfroles.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Selfrole is not yet implemented in this server.`);

        const message = await msg.reply(`${this.container.constants.EMOTES.loading}  ::  Loading the selfrole list`);
        const display = new LazyPaginatedMessage({
            embedFooterSeparator: '|',
            template: {
                content: `${this.container.constants.EMOTES.tick}  ::  Selfrole list loaded!`,
                embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setAuthor({ name: `Selfroles for ${msg.guild.name}`, iconURL: msg.guild.iconURL({ dynamic: true }) })
                    .setTitle('Use the buttons to navigate the pages.')
                    .setFooter({ text: `[${selfroles.length} Selfrole${selfroles.length === 1 ? '' : 's'}]` })
                    .setTimestamp()]
            }
        });

        chunk(selfroles, 10).forEach((selfroleList, tenPower) => display.addPageEmbed(template => template.setDescription(selfroleList.map((selfrole, onePower) => {
            const currentPos = (tenPower * 10) + (onePower + 1);
            return `\`${currentPos}\`. ${msg.guild.roles.cache.get(selfrole).name}`;
        }).join('\n'))));

        return display.run(message, msg.author).catch(err => this.container.logger.error(err));
    }

};
