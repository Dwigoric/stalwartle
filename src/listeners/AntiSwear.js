const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(...args) {
        super(...args, { event: Events.MessageCreate });
    }

    async run(msg) {
        if (!msg.guild) return null;
        if (!this.container.client.gateways.guilds.get(msg.guild.id).automod.antiSwear) return null;
        if (await msg.hasAtLeastPermissionLevel(6) && this.container.client.gateways.guilds.get(msg.guild.id).automod.ignoreMods) return null;
        if (this.container.client.gateways.guilds.get(msg.guild.id).automod.filterIgnore.antiSwear.includes(msg.channel.id)) return null;
        if (msg.author.equals(this.container.client.user)) return null;

        let swearArray = this.container.client.gateways.guilds.get(msg.guild.id).automod.swearWords.map(word => `(?:^|\\W)${word}(?:$|\\W)`);
        if (this.container.client.gateways.guilds.get(msg.guild.id).automod.globalSwears) swearArray = swearArray.concat(this.container.constants.SWEAR_WORDS_REGEX).map(word => `(?:^|\\W)${word}(?:$|\\W)`);
        const swearRegex = new RegExp(swearArray.join('|'), 'im');
        if (!swearArray.length || !swearRegex.test(msg.content)) return null;
        if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No swearing allowed, or I'll punish you!`);
        if (msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) msg.delete();

        const { duration, action } = this.container.client.gateways.guilds.get(msg.guild.id).automod.options.antiSwear;
        const actionDuration = duration ? await this.container.client.arguments.get('time').run(`${duration}m`, '', msg) : null;
        switch (action) {
            case 'warn': return this.container.client.emit('modlogAction', {
                command: this.container.client.commands.get('warn'),
                channel: msg.channel,
                guild: msg.guild,
                content: msg.content
            }, msg.author, 'Swearing with AntiSwear enabled', null);
            case 'kick': return this.container.client.commands.get('kick').run(msg, [msg.author, ['Swearing with AntiSwear enabled']]).catch(err => msg.send(err));
            case 'mute': return this.container.client.commands.get('mute').run(msg, [msg.member, actionDuration, 'Swearing with AntiSwear enabled'], true).catch(err => msg.send(err));
            case 'ban': return this.container.client.commands.get('ban').run(msg, [msg.author, null, actionDuration, ['Swearing with AntiSwear enabled']], true).catch(err => msg.send(err));
            case 'softban': return this.container.client.commands.get('softban').run(msg, [msg.author, null, ['Swearing with AntiSwear enabled']]).catch(err => msg.send(err));
        }
        return msg;
    }

};
