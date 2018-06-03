const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['t', 'tag'],
			description: 'Create and make memos!',
			extendedHelp: 'Tags currently have a limit of 15.',
			usage: '[create|remove|list|edit] (Tag:tagname) (Contents:contents) [...]',
			usageDelim: ' ',
			subcommands: true
		});

		this
			.createCustomResolver('tagname', (arg, possible, msg, [action]) => {
				if (['list'].includes(action)) return undefined;
				if (!arg && !action) throw '<:redTick:399433440975519754>  ::  Whoops! Please use at least one subcommand or give the tag. e.g. `s.tag tagnamehere`';
				if (['create', 'remove', 'edit'].includes(action) && !arg) throw '<:redTick:399433440975519754>  ::  Please provide the tag name.';
				if (arg.length > 15) throw '<:redTick:399433440975519754>  ::  It seems your tag is longer than 15 characters. Tag names must be shorter than or equal to 15 characters.';
				return arg;
			})
			.createCustomResolver('contents', (arg, possible, msg, [action]) => {
				if (['list', 'remove'].includes(action)) return undefined;
				if (['create', 'edit'].includes(action) && !arg) throw '<:redTick:399433440975519754>  ::  Please provide the new contents of the tag.';
				return arg;
			});
	}

	async run(msg, [userTag]) {
		if (!await this.client.providers.default.get('tags', msg.author.id)) await this.client.providers.default.create('tags', msg.author.id);
		const userTags = await this.client.providers.default.get('tags', msg.author.id);
		const noTagErr = `<:redTick:399433440975519754>  ::  Sorry! You have no tag named **${userTag}**.`;
		if (userTag === 'id') throw noTagErr;
		const tag = userTags[userTag];
		if (!tag) throw noTagErr;
		msg.send(`🗒  ::  ${tag}`);
	}

	async list(msg) {
		if (!await this.client.providers.default.get('tags', msg.author.id)) await this.client.providers.default.create('tags', msg.author.id);
		const userTags = await this.client.providers.default.get('tags', msg.author.id);
		const tags = Object.keys(userTags);
		tags.splice(tags.indexOf('id'), 1);
		if (!tags.length) throw '🗒  :: You currently have no tags.';
		msg.send(`🗒  ::  Your tags (${tags.length}): \`${tags.join('`, `')}\``);
	}

	async create(msg, [tag, ...contents]) {
		if (!await this.client.providers.default.get('tags', msg.author.id)) await this.client.providers.default.create('tags', msg.author.id);
		const userTags = await this.client.providers.default.get('tags', msg.author.id);
		if (userTags[tag]) throw `<:redTick:399433440975519754>  ::  **${tag}** is already your tag!`;
		if (Object.keys(userTags).length > 15) throw `<:redTick:399433440975519754>  ::  You have already reached the limit of 15 tags!`;
		const tagDetails = {};
		tagDetails[tag] = contents.join(this.usageDelim);
		await this.client.providers.default.update('tags', msg.author.id, tagDetails);
		msg.send(`<:greenTick:399433439280889858>  ::  Tag **${tag}** has been created!`);
	}

	async remove(msg, [tag]) {
		if (!await this.client.providers.default.get('tags', msg.author.id)) await this.client.providers.default.create('tags', msg.author.id);
		const userTags = await this.client.providers.default.get('tags', msg.author.id);
		if (tag === 'id') throw `<:redTick:399433440975519754>  ::  Tag **${tag}** cannot be removed. Sorry!`;
		if (!userTags[tag]) throw `<:redTick:399433440975519754>  ::  Tag **${tag}** doesn't exist or isn't yours!`;
		await this.client.providers.default._removeValue('tags', [tag], userTags);
		msg.send(`<:greenTick:399433439280889858>  ::  Tag **${tag}** has been removed!`);
	}

	async edit(msg, [tag, ...contents]) {
		if (!await this.client.providers.default.get('tags', msg.author.id)) await this.client.providers.default.create('tags', msg.author.id);
		const userTags = await this.client.providers.default.get('tags', msg.author.id);
		if (tag === 'id') throw `<:redTick:399433440975519754>  ::  Tag **${tag}** cannot be edited. Sorry!`;
		if (!userTags[tag]) throw `<:redTick:399433440975519754>  ::  Tag **${tag}** doesn't exist or isn't yours!`;
		if (!contents.length) throw `<:redTick:399433440975519754>  ::  Please provide the new contents of the tag **${tag}**.`;
		const tagDetails = {};
		tagDetails[tag] = contents.join(this.usageDelim);
		await this.client.providers.default.update('tags', msg.author.id, tagDetails);
		msg.send(`<:greenTick:399433439280889858>  ::  Tag **${tag}** has been edited!`);
	}

	async init() {
		const defProvider = this.client.providers.default;
		if (!await defProvider.hasTable('tags')) defProvider.createTable('tags');
	}

};
