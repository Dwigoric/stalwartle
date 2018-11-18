const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class MusicPrompt extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [GuildMember] });
	}

	get queue() {
		if (!MusicPrompt[this.id]) MusicPrompt[this.id] = [];
		return MusicPrompt[this.id];
	}

	addPrompt(songs) {
		MusicPrompt[this.id] = songs;
	}

	clearPrompt() {
		MusicPrompt[this.id] = [];
	}

};
