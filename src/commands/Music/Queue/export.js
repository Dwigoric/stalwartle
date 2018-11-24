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
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (!queue.length) throw `<:error:508595005481549846>  ::  The queue is empty. Add one using the \`${msg.guildSettings.get('prefix')}play\` command.`;
		let choice;
		do {
			choice = await msg.prompt('📜  ::  Should the queue be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer.').catch(() => ({ content: 'none' }));
		} while (!['file', 'haste', 'hastebin', 'none', null].includes(choice.content));
		switch (choice.content) {
			case 'file': {
				if (!msg.channel.attachable) throw '<:error:508595005481549846>  ::  I do not have the permissions to attach files to this channel.';
				return msg.channel.sendFile(Buffer.from(queue.map((track, position) => `${position + 1}  ::  ${track.info.uri}`).join('\r\n')), 'output.txt', '<:check:508594899117932544>  ::  Exported the queue as file.'); // eslint-disable-line max-len
			}
			case 'haste':
			case 'hastebin': {
				const { key } = await fetch('https://hastebin.com/documents', {
					method: 'POST',
					body: queue.map((track, position) => `${position + 1}  ::  ${track.info.uri}`).join('\r\n')
				}).then(res => res.json());
				return msg.send(`<:check:508594899117932544>  ::  Exported the queue to hastebin: <https://hastebin.com/${key}>`);
			}
		}
		return null;
	}

};
