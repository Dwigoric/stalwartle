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
		const queue = this.client.gateways.music.get(msg.guild.id, true).get('queue');
		this.client.gateways.music.get(msg.guild.id, true).update('queue', msg.guild.me.voice.channelID ? queue.slice(0, 1) : []).concat(user ? queue.filter((track, index) => index && track.requester !== user.id) : []); // eslint-disable-line max-len
		msg.send(`<:check:508594899117932544>  ::  Successfully cleared the music queue for this server${user ? ` of ${user.tag}'s requests` : ''}.`);
	}

};
