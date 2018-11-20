const { Extendable, KlasaGuild } = require('klasa');

module.exports = class VoteSkips extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaGuild] });
	}

	get voteskips() {
		if (!VoteSkips[this.id]) VoteSkips[this.id] = [];
		return VoteSkips[this.id];
	}

	addVoteskip(vote, members) {
		VoteSkips[this.id].push(vote);
		VoteSkips[this.id] = VoteSkips[this.id].filter(voter => members.has(voter));
	}

	clearVoteskips() {
		VoteSkips[this.id] = [];
	}

};
