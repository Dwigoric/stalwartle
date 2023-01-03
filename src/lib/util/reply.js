const { send, reply } = require('@sapphire/plugin-editable-commands');
const { Permissions } = require('discord.js');
const { ChannelTypes } = require('discord.js/typings/enums');

module.exports = (message, options) => {
    const canReadHistory = message.channel.type === ChannelTypes.DM || message.channel.permissionsFor(message.guild.me).has(Permissions.FLAGS.READ_MESSAGE_HISTORY);
    return (canReadHistory ? reply : send)(message, options)
        .catch(err => canReadHistory ?
            send(message, options) :
            Promise.reject(err)
        );
};
