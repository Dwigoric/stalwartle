const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            preconditions: ['DJOnly'],
            description: 'Clears the music queue for the server, optionally those requested by a specified user.'
        });
        this.usage = '[Requester:user]';
    }

    async messageRun(msg, args) {
        const user = await args.pick('user').catch(() => null);

        const player = this.container.erela.players.get(msg.guild.id);
        const { queue } = player || { queue: [] };
        if (queue.length) queue.clear();
        await this.container.stores.get('gateways').get('musicGateway').update(msg.guild.id, { queue: Array.from(queue).concat(user ? Array.from(queue.filter((track, index) => index && track.requester !== user.id)) : []) });

        reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully cleared the music queue for this server${user ? ` of ${user.tag}'s requests` : ''}.`);
    }

};
