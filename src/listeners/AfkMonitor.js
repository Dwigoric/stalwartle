const { Listener, Events } = require('@sapphire/framework');
const { Duration } = require('@sapphire/time-utilities');

module.exports = class extends Listener {

    constructor(...args) {
        super(...args, { event: Events.MessageCreate });
    }

    async run(msg) {
        if (this.container.client.gateways.users.get(msg.author.id).afkIgnore.includes(msg.channel.id)) return;
        if (this.container.client.gateways.afk.get(msg.author.id).timestamp && !this.container.client.gateways.users.get(msg.author.id).afktoggle) {
            const wbMsg = `${this.container.constants.EMOTES.blobwave}  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`;
            this.container.client.gateways.afk.delete(msg.author.id);
            msg.send(wbMsg).catch(() => msg.author.send(wbMsg).catch());
        }

        const afkUser = msg.mentions.users.filter(us => this.container.client.gateways.afk.cache.has(us.id)).first();
        if (!afkUser) return;
        const { reason, timestamp } = this.container.client.gateways.afk.get(afkUser.id);
        msg.send([
            `${this.container.constants.EMOTES.blobping}  ::  ${msg.author}, **${await msg.guild.members.fetch(afkUser.id).then(mb => mb.displayName).catch(() => afkUser.username)}** is currently AFK. [Last seen ${Duration.toNow(timestamp)} ago]`, // eslint-disable-line max-len
            reason ? `**Reason**: ${reason}` : ''
        ].join('\n'), { disableMentions: 'everyone' });
    }

};
