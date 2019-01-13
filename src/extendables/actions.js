const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) { super(...args, { appliesTo: [GuildMember] }); }

	get actions() {
		if (!this._actions) return [];
		return this._actions;
	}

	async addAction(action) {
		if (!this._actions) Object.defineProperty(this, '_actions', { value: [] });
		this._actions.push(action);
		this.client.setTimeout(() => {
			this._actions.shift();
			if (!this._actions.length) this.resetActions();
		}, this.guild.settings.get('automod.options.quota.within') * 60000);
	}

	async resetActions() {
		return delete this._actions;
	}

};
