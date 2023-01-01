const { Command, Args, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Converts your HEX code to its RGB equivalent. The `#` at the beginning of the HEX code is optional.'
        });
        this.usage = '<HexColor:hexcode>';
        this.resolver = Args.make((parameter, { argument }) => {
            const regex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i;
            return regex.test(parameter) ? Args.ok(parameter) : Args.error({
                argument,
                parameter,
                identifier: 'MalformattedHexCode',
                message: 'The string provided was not a hex code.'
            });
        });
    }

    async messageRun(msg, args) {
        let hexColor = await args.pickResult(this.resolver);
        if (!hexColor.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide a valid hex code to convert.`);
        hexColor = hexColor.value;

        function hexToRgb(hex) {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace(shorthandRegex, (mm, rd, gn, bl) => rd + rd + gn + gn + bl + bl));
            const rgbObj = result ? {
                rd: parseInt(result[1], 16),
                gn: parseInt(result[2], 16),
                bl: parseInt(result[3], 16)
            } : null;

            return [rgbObj.rd, rgbObj.gn, rgbObj.bl];
        }
        return reply(msg, `\`#${hexColor}\` is equivalent to \`rgb(${hexToRgb(hexColor.substring(0, 9)).join(', ')})\`.`);
    }

};
