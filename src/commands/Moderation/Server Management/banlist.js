const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['BAN_MEMBERS'],
            cooldownDelay: 60,
            description: 'Gives a list of the banned users in the server.',
            detailedDescription: 'The default output is hastebin. If you want to get the list as an attachment, use the `--file` flag.',
            flags: ['file']
        });
    }

    async messageRun(msg, args) {
        const banlist = await msg.guild.bans.fetch();
        if (!banlist.size) return reply(msg, `${this.container.constants.EMOTES.blobban}  ::  **${msg.guild.name}** has no bans yet.`);
        const results = banlist.map(ban => [ban.user.tag, ban.reason]);
        return await this.#handleMessage(
            msg, {
                sendAs: args.getFlags('file') ? 'file' : 'haste',
                hastebinUnavailable: false,
                url: null
            },
            results.map((result, index, thisArray) => {
                const users = thisArray.map(res => res[0]);
                const longest = users.reduce((long, str) => Math.max(long, str.length), 0);
                return `${index + 1}. ${result[0].padEnd(longest)} :: ${result[1] || 'Not specified.'}`;
            }).join('\r\n'));
    }

    async #handleMessage(msg, options, result) {
        switch (options.sendAs) {
            case 'file': {
                if (msg.channel.permissionsFor(this.container.client.user).has(['SEND_MESSAGES', 'ATTACH_FILES'])) return reply(msg, { files: [{ attachment: Buffer.from(result), name: 'banlist.txt' }], content: `${this.container.constants.EMOTES.tick}  ::  Sent the ban list as a file.` }); // eslint-disable-line max-len
                options = await this.#getTypeOutput(msg, options);
                if (options === null) return null;
                return this.#handleMessage(msg, options, result);
            }
            case 'haste':
            case 'hastebin': {
                if (!options.url) options.url = await this.#getHaste(result).catch(() => null);
                if (options.url) return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Sent the ban list to hastebin: <${options.url}>`);
                options.hastebinUnavailable = true;
                options.sendAs = 'file';
                return this.#handleMessage(msg, options, result);
            }
            case 'none':
                return null;
            default: {
                options = await this.#getTypeOutput(msg, options);
                if (options === null) return null;
                return this.#handleMessage(msg, options, result);
            }
        }
    }

    async #getTypeOutput(msg, options) {
        const _options = [];
        if (msg.channel.permissionsFor(this.container.client.user).has('ATTACH_FILES')) _options.push('file');
        if (!options.hastebinUnavailable) _options.push('hastebin');
        // eslint-disable-next-line max-len
        if (!_options.length) {
            reply(msg, `${this.container.constants.EMOTES.xmark}  ::  It seems that hastebin is unavailable, and I cannot send an attachment to this channel. Please check my permissions and retry.`);
            return null;
        }
        let _choice;
        do {
            _choice = await msg.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch(() => ({ content: 'none' }));
        } while (!['file', 'haste', 'hastebin', 'default', 'none', null].includes(_choice.content));
        options.sendAs = _choice.content;
        return options;
    }

    async #getHaste(body) {
        const { key } = await fetch('https://www.toptal.com/developers/hastebin/documents', { method: 'POST', body }).then(res => res.json());
        return `https://www.toptal.com/developers/hastebin/${key}.txt`;
    }

};
