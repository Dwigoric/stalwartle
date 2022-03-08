const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { chunk } = require('@sapphire/utilities');
const { MessageEmbed } = require('discord.js');
const { LazyPaginatedMessage } = require('@sapphire/discord.js-utilities');
const moment = require('moment-timezone');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 10,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            aliases: ['cookies', 'stalkie', 'stalkies'],
            description: 'Gives a person a cookie!',
            detailedDescription: [
                "If you want to check someone's cookies, just add the `--check` flag. e.g. `s.cookie @Stalwartle --check`",
                'If you want to check your cookies, simply do not give a user.',
                '\nTo look for the leaderboard, use the `lb` subcommand, e.g. `s.cookie lb`.',
                'To get the global leaderboard, use the flag `--global`, e.g. `s.cookie lb --global`'
            ].join('\n'),
            flags: ['check'],
            subCommands: ['lb', { input: 'default', default: true }]
        });
    }

    async default(msg, args) {
        const person = await args.pick('user').catch(() => null);

        // eslint-disable-next-line max-len
        if (!person) return reply(msg, `🍪  ::  You have **${this.container.stores.get('gateways').get('userGateway').get(msg.author.id, 'cookies')}** cookie${this.container.stores.get('gateways').get('userGateway').get(msg.author.id, 'cookies') === 1 ? '' : 's'}.`);
        if (person.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I know cookies are delicious, but you can't give yourself a cookie! Don't be greedy 😿`);
        if (person.id === this.container.client.user.id) return reply(msg, `🍪  ::  **${msg.member.displayName}** gave me a cookie! Oh wait, I already have infinite cookies!`);
        if (person.bot) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I wonder if bots can eat cookies... 🤔`);
        const cookies = this.container.stores.get('gateways').get('userGateway').get(person.id, 'cookies');
        if (args.getFlags('check')) return reply(msg, `🍪  ::  **${person.tag}** has **${cookies}** cookie${cookies === 1 ? '' : 's'}.`);
        const cookieTask = (await this.container.tasks.list({})).filter(job => job.data.task === 'CookieReset' && job.data.payload.user === msg.author.id);
        if (cookieTask.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You've just given someone a cookie! You can use it again ${moment(cookieTask[0].delay).fromNow()}.`);
        await this.container.tasks.create('CookieReset', { user: msg.author.id }, Date.now() + (1000 * 60 * 60));
        await this.container.stores.get('gateways').get('userGateway').update(person.id, 'cookies', cookies + 1);
        return reply(msg, `🍪  ::  **${msg.member.displayName}** gave ${person} a cookie, with a total of **${cookies + 1}** cookie${!cookies ? '' : 's'}!`);
    }

    async lb(msg) {
        if (!msg.channel.permissionsFor(this.container.client.user).has(['EMBED_LINKS', 'MANAGE_MESSAGES'])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I need to be able to **Embed Links** and **Manage Messages** (permissions).`); // eslint-disable-line max-len
        const message = await msg.reply(`${this.container.constants.EMOTES.loading}  ::  Loading leaderboard...`);
        let list = await this.container.database.getAll('users').then(usr => usr.filter(us => us.cookies).sort((a, b) => b.cookies > a.cookies ? 1 : -1));
        list = Array.from((await msg.guild.members.fetch()).values()).filter(member => list.findIndex(user => user.id === member.id) !== -1);
        if (!list.length) return message.edit('🍪  ::  Whoops! It seems no one in this server has any cookie yet!');

        const authorPos = list.findIndex(ckU => ckU.id === msg.author.id) + 1;
        list = chunk(list, 10);
        if (list.length > 25) list.splice(24, list.length - 25);

        const userCookies = this.container.stores.get('gateways').get('userGateway').get(msg.author.id, 'cookies');
        const display = new LazyPaginatedMessage({
            embedFooterSeparator: '|',
            template: {
                content: `${this.container.constants.EMOTES.tick}  ::  Leaderboard loaded!`,
                embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle(`🍪 Stalkie Leaderboard`)
                    .setFooter({ text: `Your Position: ${authorPos ? `#${authorPos}` : 'None'} | You have ${userCookies} Stalkie${userCookies === 1 ? '' : 's'}.` })]
            }
        });

        list.forEach((top, tenPower) =>
            display.addAsyncPageEmbed(async template => {
                top = await Promise.all(top.map(topUser => this.container.client.users.fetch(topUser.id, { cache: false })));

                template.setDescription(top.map((topUser, onePower) => {
                    const topUserCookies = this.container.stores.get('gateways').get('userGateway').get(topUser.id, 'cookies');
                    return `\`${onePower === 9 ? (tenPower + 1) * 10 : (tenPower * 10) + (onePower + 1)}\`. ${topUser.tag} ➱ ${topUserCookies} Stalkie${topUserCookies === 1 ? '' : 's'}`;
                }).join('\n\n'));

                return template;
            })
        );

        return display.run(message, msg.author);
    }

};
