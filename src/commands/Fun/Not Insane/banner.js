const { Command, container } = require('@sapphire/framework');
const { codeBlock } = require('@sapphire/utilities');
const { reply } = container;
const figletAsync = require('util').promisify(require('figlet'));

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Creates an ASCII banner from what you supply.',
            detailedDescription: [
                'If you want a custom ASCII character width (e.g. to customize to your screen resolution) run `s.userconf set bannerWidth (integer)`.',
                'By default, the character width is not set.'
            ].join('\n')
        });
        this.usage = '<Banner:string{1,50}>';
    }

    async messageRun(msg, args) {
        let banner = await args.restResult('string');
        if (!banner.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the text to convert to banner.`);
        banner = banner.value;
        if (banner.length > 50) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Banner must be between 1 to 50 characters (inclusive).`);

        const bannerWidth = this.container.stores.get('gateways').get('userGateway').get(msg.author.id, 'bannerWidth');
        const data = await figletAsync(banner, { width: bannerWidth === 0 ? undefined : bannerWidth });

        if (data.length > 2000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The banner was too long! Please try making it shorter.`);
        if (!data) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Something went wrong! Did you supply a non-alphanumeric character?`);
        return reply(msg, codeBlock('', data));
    }

};
