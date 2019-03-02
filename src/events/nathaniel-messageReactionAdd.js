const { Event } = require('../Modules/Index.js');

const roles = {
	// Subscriber
	main: '521823218424741908',
	// Company
	'0⃣': '521822642756386816',
	// Staff
	'1⃣': '521822887334903818',
	// Downtime
	'2⃣': '420045140732805120',
	// Database
	'3⃣': '521823072945438730',
	// Bot Updates
	'4⃣': '439860510226251786',
	// Partner Updates
	'5⃣': '431210967595089926',
	// Stream Updates
	'6⃣': '521822411608555550',
	// Twitter Updates
	'7⃣': '420040434342166568',
	// Other Updates
	'8⃣': '521823548487237643'
};

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageReactionAdd' });
	}

	run(reaction, usr) {
		if (reaction.message.guild.id !== '406966876367749131') return;
		if (reaction.message.channel.id !== '406994802266079243') return;
		if (reaction.message.id !== '521832496997072932') return;

		const { guild } = reaction.message;

		if (!guild.member(usr.id).roles.has(roles.main)) guild.member(usr.id).roles.add(roles.main);
		if (!guild.member(usr.id).roles.has(roles[reaction.emoji.name])) guild.member(usr.id).roles.add(roles[reaction.emoji.name]);
	}

};
