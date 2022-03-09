const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Converts your RGB value to its HEX code equivalent.'
        });
    }

    async messageRun(msg, args) {
        const rgb = await args.repeatResult('integer', { times: 3 });
        if (!rgb.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the RGB values.`);
        const [red, grn, blu] = rgb.value;

        function rgbToHex(rd, gn, bl) {
            return `#${((1 << 24) + (rd << 16) + (gn << 8) + bl).toString(16).slice(1)}`;
        }
        try {
            return reply(msg, `\`rgb(${rgb.value.join(', ')})\` has the HEX code of \`${rgbToHex(red, grn, blu)}\`.`);
        } catch (err) {
            return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Invalid color RGB value!`);
        }
    }

};
