const { Extendable, KlasaGuild } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) { super(...args, { appliesTo: [KlasaGuild] });	}

	addVoteskip(vote, members) {
		this.voteskips.push(vote);
		this.voteskips = this.voteskips.filter(voter => members.has(voter));
	}

	clearVoteskips() {
		this.voteskips = [];
	}

};
