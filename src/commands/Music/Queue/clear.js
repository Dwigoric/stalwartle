const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 5,
			description: 'Clears the music queue for the server, optionally those requested by a specified user.',
			usage: '[Requester:user]'
		});
	}

	async run(msg, [user]) {
		const { queue, playlist, history } = await this.client.providers.default.get('music', msg.guild.id);
		this.client.providers.default.update('music', msg.guild.id, {
			playlist,
			history,
			queue: (msg.guild.player.playing ? queue.slice(0, 1) : []).concat(user ? queue.filter((track, index) => index && track.requester !== user.id) : [])
		});
		msg.send(`<:check:508594899117932544>  ::  Successfully cleared the music queue for this server${user ? ` of ${user.tag}'s requests` : ''}. Check the new queue with \`${msg.guild.settings.get('prefix')}queue\`.`); // eslint-disable-line max-len
	}

};
