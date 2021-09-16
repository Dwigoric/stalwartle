const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Exports the server music queue.'
		});
	}

	async run(msg) {
		const { queue = [] } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length) throw `${this.client.constants.EMOTES.xmark}  ::  The queue is empty. Add one using the \`${msg.guild.settings.get('prefix')}play\` command.`;
		let choice;
		do {
			choice = await msg.prompt('📜  ::  Should the queue be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer.').catch(() => ({ content: 'none' }));
		} while (!['file', 'haste', 'hastebin', 'none', null].includes(choice.content));
		switch (choice.content) {
			case 'file': {
				if (!msg.channel.attachable) throw `${this.client.constants.EMOTES.xmark}  ::  I do not have the permissions to attach files to this channel.`;
				return msg.channel.sendFile(Buffer.from(queue.map(track => track.info.uri).join('\r\n')), 'output.txt', `${this.client.constants.EMOTES.tick}  ::  Exported the queue as file.`); // eslint-disable-line max-len
			}
			case 'haste':
			case 'hastebin': {
				const { key } = await fetch('https://hastebin.com/documents', {
					method: 'POST',
					body: queue.map(track => track.info.uri).join('\r\n')
				}).then(res => res.json()).catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  Sorry! An unknown error occurred.`; });
				return msg.send(`${this.client.constants.EMOTES.tick}  ::  Exported the queue to hastebin: <https://hastebin.com/${key}.stalwartle>`);
			}
		}
		return null;
	}

};
