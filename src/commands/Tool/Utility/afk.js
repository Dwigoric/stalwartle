const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Marks you as AFK. Supplying a reason is optional.',
            detailedDescription: [
                "If someone mentions you, I will inform them that you are AFK (if you are), including how long you've been AFK.",
                'If you want me to ignore a channel for you from AFK stuff, just use `s.userconf set afkIgnore <channel>`. Note that this applies only for you.'
            ].join('\n')
        });
        this.usage = '[Reason:string]';
    }

    async messageRun(msg, args) {
        const reason = await args.rest('string').then(str => str.trim()).catch(() => null);

        if (await this.container.stores.get('gateways').get('afkGateway').has(msg.author.id) && this.container.stores.get('gateways').get('userGateway').get(msg.author.id, 'afktoggle')) {
            await this.container.stores.get('gateways').get('afkGateway').delete(msg.author.id);
            return reply(msg, `${this.container.constants.EMOTES.blobwave}  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`);
        }

        if (typeof reason === 'string' && reason.length > 1024) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Your AFK reason is too long! Please try to shorten it.`);
        await this.container.stores.get('gateways').get('afkGateway').update(msg.author.id, { reason, timestamp: Date.now() });
        if (msg.guild && msg.guild.me.permissions.has('MOVE_MEMBERS') && msg.member.voice.channel && this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'afkChannelOnAfk') && msg.guild.afkChannelId) msg.member.voice.setChannel(msg.guild.afkChannelId, 'Moved to AFK channel due to AFK status'); // eslint-disable-line max-len
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  ${msg.author}, I've set you as AFK. ${reason ? `**Reason**: ${reason}` : ''}`);
    }

};
