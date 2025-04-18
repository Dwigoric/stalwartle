const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;
const { MessageEmbed } = require('discord.js');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['ri', 'rinfo', 'roleinfo'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives information about a role.',
            detailedDescription: "You can use the role's name in providing the role.",
            subCommands: ['id', { input: 'default', default: true }]
        });
        this.usage = '[id] <Role:role>';
    }

    async messageRun(msg, args) {
        let role = await args.pickResult('role');
        if (!role.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the role.`);
        role = role.value;

        const hexToRgb = hex => {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace(shorthandRegex, (mm, rd, gn, bl) => rd + rd + gn + gn + bl + bl));
            const rgbObj = result ? {
                rd: parseInt(result[1], 16),
                gn: parseInt(result[2], 16),
                bl: parseInt(result[3], 16)
            } : null;

            return [rgbObj.rd, rgbObj.gn, rgbObj.bl];
        };

        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor(role.hexColor)
                .setAuthor({ name: `Role information for ${role.name}` })
                .addField('ID', role.id)
                .addField('Hoisted', String(role.hoist).replace(/^./, i => i.toUpperCase()), true)
                .addField('Managed', String(role.managed).replace(/^./, i => i.toUpperCase()), true)
                .addField('Mentionable', String(role.mentionable).replace(/^./, i => i.toUpperCase()), true)
                .addField('Color', `HEX: ${role.hexColor}\nRGB: ${hexToRgb(role.hexColor).join(', ')}`, true)
                .addField('Position', `${msg.guild.roles.cache.size - role.position} out of ${msg.guild.roles.cache.size}`, true)
                .addField('Created', `<t:${(role.createdAt / 1000).toFixed()}:f> (<t:${(role.createdAt / 1000).toFixed()}:R>)`)
                .setFooter({ text: `Information requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()]
        });
    }

    async id(msg, args) {
        let role = await args.pickResult('role');
        if (!role.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the role.`);
        role = role.value;

        return reply(msg, `The role ID of **${role.name}** is \`${role.id}\`.`);
    }

};
