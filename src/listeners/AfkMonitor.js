const { Listener, Events } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { Duration } = require('@sapphire/time-utilities');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.MessageCreate });
    }

    async run(msg) {
        if (this.container.stores.get('gateways').get('userGateway').get(msg.author.id).afkIgnore.includes(msg.channel.id)) return;
        if (this.container.stores.get('gateways').get('afkGateway').get(msg.author.id).timestamp && !this.container.stores.get('gateways').get('userGateway').get(msg.author.id).afktoggle) {
            const wbMsg = `${this.container.constants.EMOTES.blobwave}  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`;
            this.container.stores.get('gateways').get('afkGateway').delete(msg.author.id);
            send(msg, wbMsg).catch(() => msg.author.send(wbMsg).catch());
        }

        const afkUser = msg.mentions.users.filter(us => this.container.stores.get('gateways').get('afkGateway').cache.has(us.id)).first();
        if (!afkUser) return;
        const { reason, timestamp } = this.container.stores.get('gateways').get('afkGateway').get(afkUser.id);
        send(msg, [
            `${this.container.constants.EMOTES.blobping}  ::  ${msg.author}, **${await msg.guild.members.fetch(afkUser.id).then(mb => mb.displayName).catch(() => afkUser.username)}** is currently AFK. [Last seen ${Duration.toNow(timestamp)} ago]`, // eslint-disable-line max-len
            reason ? `**Reason**: ${reason}` : ''
        ].join('\n'), { disableMentions: 'everyone' });
    }

};
