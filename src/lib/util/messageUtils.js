const { container } = require('@sapphire/pieces');
const { send } = require('@sapphire/plugin-editable-commands');
const { isObject } = require('@sapphire/utilities');

async function prompt(message, content, time = 30000) {
    if (!isObject(content) && typeof content !== 'string') throw new TypeError(`Expected an object or a string but received ${typeof content}`);

    const msg = await message.channel.send(content);
    const response = await message.channel.awaitMessageComponent({ filter: resMsg => resMsg.author === message.author, time }).catch(() => null);
    msg.delete();
    if (response === null) send(message, `${container.constants.EMOTES.xmark}  ::  The prompt has timed out.`);
    return response;
}

module.exports = {
    prompt
};
