const { Command } = require('klasa');
const { Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Searches song lyrics using your search query.',
			usage: '<Query:string>'
		});
	}

	async run(msg, [query]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading lyrics...');
		const { data } = await fetch(`https://api.ksoft.si/lyrics/search?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${this.client.auth.ksoftAPIkey}` } }).then(res => res.json()).catch(() => { throw '<:error:508595005481549846>  ::  An error occured. Please try again. Sorry \'bout that!'; }); // eslint-disable-line max-len
		if (!data.length) throw '<:error:508595005481549846>  ::  No song lyrics found.';
		const fullLyrics = [
			[
				`*__**${escapeMarkdown(data[0].name)}**__`,
				`by **${escapeMarkdown(data[0].artist)}**`,
				`${data[0].album ? `on ${escapeMarkdown(data[0].album)}` : 'Single Track'}*\n`
			].join('\n'),
			escapeMarkdown(data[0].lyrics),
			'\n__*Powered by KSoft.Si API*__ '
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

		await msg.channel.send(fullLyrics, { split: { char: '\u200b' } }).catch(() => msg.channel.send(fullLyrics, { split: true }));
		message.delete();
	}

};
