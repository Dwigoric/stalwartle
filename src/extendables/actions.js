const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [GuildMember] });
		this._actions = null;
	}

	get actions() {
		if (!this._actions) return [];
		return this._actions;
	}

	async addAction(action) {
		if (!this._actions) this._actions = [];
		this._actions.push(action);
		this.client.setTimeout(() => {
			this._actions.shift();
			if (!this._actions.length) this.resetActions();
		}, this.guild.settings.get('automod.options.quota.within') * 60000);
	}

	async resetActions() {
		this._actions = null;
	}

};
