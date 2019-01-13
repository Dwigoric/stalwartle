const { Extendable, KlasaGuild } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaGuild] });
		this._voteskips = null;
	}

	get voteskips() {
		if (!this._voteskips) return [];
		return this._voteskips;
	}

	addVoteskip(vote, members) {
		if (!this._voteskips) this._voteskips = [];
		this._voteskips.push(vote);
		this._voteskips = this._voteskips.filter(voter => members.has(voter));
	}

	clearVoteskips() {
		this._voteskips = null;
	}

};
