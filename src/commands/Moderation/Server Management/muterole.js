const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 7,
            runIn: ['text'],
            requiredPermissions: 'MANAGE_ROLES',
            description: 'Sets the mute role for the server.',
            extendedHelp: 'Set the server\'s mute role using the name you provide.',
            usage: '[reset] <RoleName:string> [...]',
            usageDelim: ' ',
            subcommands: true
        });
    }

    async run(msg, [...role]) {
        const newRole = await msg.guild.roles.create({
            data: {
                name: role.join(this.usageDelim),
                color: 'DARKER_GREY',
                permissions: 0
            }
        }).catch(() => null);
        if (!newRole) throw `${this.client.constants.EMOTES.xmark}  ::  I cannot create the muted role. Please double-check my permissions.`;
        msg.guild.settings.update('muteRole', newRole.id, msg.guild);
        return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully set this server's mute role to **${newRole.name}**.`);
    }

    async reset(msg) {
        msg.guild.settings.reset('muteRole');
        return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully reset this server's mute role.`);
    }

};
