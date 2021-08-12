const { Command } = require('@sapphire/framework');
const figletAsync = require('util').promisify(require('figlet'));

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Creates an ASCII banner from what you supply.',
            extendedHelp: [
                'If you want a custom ASCII character width (e.g. to customize to your screen resolution) run `s.userconf set bannerWidth (integer)`.',
                'By default, the character width is not set.'
            ],
            usage: '<Banner:string{1,50}>'
        });
    }

    async run(msg, [banner]) {
        const bannerWidth = msg.author.settings.get('bannerWidth');
        const data = await figletAsync(banner, { width: bannerWidth === 0 ? undefined : bannerWidth });
        if (data.length > 2000) throw `${this.client.constants.EMOTES.xmark}  ::  The banner was too long! Please try making it shorter.`;
        if (!data) throw `${this.client.constants.EMOTES.xmark}  ::  Something went wrong! Did you supply a non-alphanumeric character?`;
        return msg.sendCode('', data);
    }

};
