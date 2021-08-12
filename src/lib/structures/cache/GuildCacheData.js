const CacheDataInstance = require('./CacheDataInstance');

class GuildCacheData extends CacheDataInstance {

    constructor(id) {
        super(id);

        this.voteskips = [];
    }

    addVoteskip(vote, members) {
        this.voteskips.push(vote);
        this.voteskips = this.voteskips.filter(voter => members.has(voter));
    }

    clearVoteskips() {
        this.voteskips = [];
    }

}

module.exports = GuildCacheData;
