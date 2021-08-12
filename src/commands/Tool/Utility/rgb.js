const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'Converts your HEX code to its RGB equivalent. The `#` at the beginning of the HEX code is optional.',
            usage: '<hexColor:regex/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/>'
        });
    }

    async run(msg, [hexColor]) {
        hexColor = hexColor.input;

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
        msg.send(`\`${hexColor}\` has the RGB value of \`${hexToRgb(hexColor.substring(0, 9)).join(', ')}\`.`);
    }

};
