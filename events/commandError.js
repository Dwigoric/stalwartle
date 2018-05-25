const { Event, util } = require('klasa');
const { join } = require('path');

module.exports = class extends Event {

	run(msg, command, params, error) {
		if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${join(command.dir, ...command.file)}\n${error.stack || error}`);
		if (error.message) msg.send(`⚠ Whoa! You found a bug! Please catch this bug and send it using the \`bug\` command!${util.codeBlock('xl', error)}`).catch(err => this.client.emit('wtf', err));
		else msg.sendMessage(error).catch(err => this.client.emit('wtf', err));
	}

};
