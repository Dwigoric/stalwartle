const { Command } = require('@sapphire/framework');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            requiredPermissions: 'BAN_MEMBERS',
            cooldown: 60,
            description: 'Gives a list of the banned users in the server.',
            extendedHelp: [
                'The default output is hastebin. If you want to get the list with an attachment, use the `--output` flag.',
                'Uses of the `--output` flag:',
                '`--output=hastebin` OR `--output=haste` = sends the ban list via hastebin',
                '`--output=file` = sends the ban list via attachment'
            ]
        });
    }

    async messageRun(msg) {
        const banlist = await msg.guild.fetchBans();
        if (!banlist.size) return msg.send(`<:blobban:446165778933219338>  ::  **${msg.guild.name}** has no bans yet.`);
        const results = banlist.map(ban => [ban.user.tag, ban.reason]);
        return await this.handleMessage(
            msg, {
                sendAs: msg.flagArgs.output || 'haste',
                hastebinUnavailable: false,
                url: null
            },
            results.map((result, index, thisArray) => {
                const users = thisArray.map(res => res[0]);
                const longest = users.reduce((long, str) => Math.max(long, str.length), 0);
                return `${index + 1}. ${result[0].padEnd(longest)} :: ${result[1] || 'Not specified.'}`;
            }).join('\r\n'));
    }

    async handleMessage(msg, options, result) {
        switch (options.sendAs) {
            case 'file': {
                if (msg.channel.attachable) return msg.channel.sendFile(Buffer.from(result), 'banlist.txt', `${this.container.client.constants.EMOTES.tick}  ::  Sent the ban list as a file.`);
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, result);
            }
            case 'haste':
            case 'hastebin': {
                if (!options.url) options.url = await this.getHaste(result).catch(() => null);
                if (options.url) return msg.sendMessage(`${this.container.client.constants.EMOTES.tick}  ::  Sent the ban list to hastebin: ${options.url}`);
                options.hastebinUnavailable = true;
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, result);
            }
            case 'none':
                return null;
            default: {
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, result);
            }
        }
    }

    async getTypeOutput(msg, options) {
        const _options = [];
        if (msg.channel.attachable) _options.push('file');
        if (!options.hastebinUnavailable) _options.push('hastebin');
        // eslint-disable-next-line max-len
        if (!_options.length) throw `${this.container.client.constants.EMOTES.xmark}  ::  It seems that hastebin is unavailable, and I cannot send an attachment to this channel. Please check my permissions and retry.`;
        let _choice;
        do {
            _choice = await msg.prompt(`Choose one of the following options: ${_options.join(', ')}`).catch(() => ({ content: 'none' }));
        } while (!['file', 'haste', 'hastebin', 'default', 'none', null].includes(_choice.content));
        options.sendAs = _choice.content;
    }

    async getHaste(body) {
        const { key } = await fetch(`https://hastebin.com/documents?`, { method: 'POST', body }).then(res => res.json());
        return `https://hastebin.com/${key}.txt`;
    }

};
