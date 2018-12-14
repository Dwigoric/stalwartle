const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Searches song lyrics using your search query.',
			usage: '<Query:string>'
		});
	}

	async run(msg, [query]) {
		const { data } = await fetch(`https://api.ksoft.si/lyrics/search?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${this.client.auth.ksoftAPIkey}` } }).then(res => res.json());
		if (!data.length) throw '<:error:508595005481549846>  ::  No song lyrics found.';
		const lyrics = data[0].lyrics.split('\n');
		while (lyrics.indexOf('') >= 0) lyrics.splice(lyrics.indexOf(''), 1, '\u200b');
		const fullLyrics = [
			`__***${data[0].name}** by ${data[0].artist}*${data[0].album ? ` on ${data[0].album}` : ''}__`,
			lyrics.join('\n')
		].join('\n');

		const swearArray = (msg.guild ? msg.guild.settings.get('automod.swearWords').map(word => `(?:^|\\W)${word}(?:$|\\W)`) : []).concat([
			'raped?',
			'bullshit',
			'nigga',
			'nigger',
			'fuc?ke?r?',
			'cunt',
			'cnut',
			'b(i|1|!)tch',
			'd(i|1)ck',
			'pussy',
			'asshole',
			'blowjob',
			'c(u|0|o|\\(\\))ck',
			'sex',
			'porn'
		]).map(word => `(?:^|\\W)${word}(?:$|\\W)`);
		const swearRegex = new RegExp(swearArray.join('|'), 'im');
		if (swearRegex.test(fullLyrics) && msg.guild && !msg.channel.nsfw) throw '<:error:508595005481549846>  ::  The song contains NSFW lyrics and this channel is not marked as NSFW.';

		return msg.channel.send(fullLyrics, { split: { char: '\u200b' } }).catch(() => msg.channel.send(fullLyrics, { split: true }));
	}

};
