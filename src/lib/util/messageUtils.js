const { container } = require('@sapphire/pieces');
const { reply } = require('@sapphire/plugin-editable-commands');
const { isObject } = require('@sapphire/utilities');

async function prompt(message, content, time = 30000) {
    if (!isObject(content) && typeof content !== 'string') throw new TypeError(`Expected an object or a string but received ${typeof content}`);

    const msg = await message.channel.send(content);
    const responses = await message.channel.awaitMessages({ filter: resMsg => resMsg.author.id === message.author.id, max: 1, time, errors: ['time'] }).catch(() => null);
    msg.delete();
    if (responses.size === 0) reply(message, `${container.constants.EMOTES.xmark}  ::  The prompt has timed out.`);
    return responses.first();
}

module.exports = {
    prompt
};
