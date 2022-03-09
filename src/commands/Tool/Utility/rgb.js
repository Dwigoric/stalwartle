const { Command, Args } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Converts your HEX code to its RGB equivalent. The `#` at the beginning of the HEX code is optional.'
        });

        this.resolver = Args.make((parameter, { argument }) => {
            const regex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i;
            if (regex.test(parameter)) {
                return Args.ok(parameter);
            } else {
                return Args.error({
                    argument,
                    parameter,
                    identifier: 'MalformattedHexCode',
                    message: 'The string provided was not a hex code.'
                });
            }
        });
    }

    async messageRun(msg, args) {
        let hexColor = await args.pickResult(this.resolver);
        if (!hexColor.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide a valid hex code to convert.`);
        hexColor = hexColor.value;

        function hexToRgb(hex) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, (mm, rd, gn, bl) => rd + rd + gn + gn + bl + bl);
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            var rgbObj = result ? {
                rd: parseInt(result[1], 16),
                gn: parseInt(result[2], 16),
                bl: parseInt(result[3], 16)
            } : null;

            return [rgbObj.rd, rgbObj.gn, rgbObj.bl];
        }
        return reply(msg, `\`${hexColor}\` is equivalent to \`rgb(${hexToRgb(hexColor.substring(0, 9)).join(', ')})\`.`);
    }

};
