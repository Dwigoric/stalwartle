const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [GuildMember] });
		this._messages = null;
	}

	get messages() {
		if (!this._messages) return [];
		return this._messages;
	}

	async addMessage(message) {
		if (!this._messages) this._messages = [];
		this._messages.push(message);
		this.client.setTimeout(() => {
			this._messages.shift();
			if (!this._messages.length) this._messages = null;
		}, this.guild.settings.get('automod.options.antiSpam.within') * 1000);
	}

};
