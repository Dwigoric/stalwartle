const { Command } = require('klasa');
const math = require('mathjs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['calc', 'calculator'],
			description: 'Performs mathematical operations.',
			extendedHelp: [
				'Possible operations:',
				'- fundamental operations',
				'- expressions involving imaginary numebrs',
				'- unit conversion',
				'- trigonometric functions',
				'- others'
			].join('\n'),
			usage: '<MathExpression:string>'
		});
	}

	async run(msg, [mExp]) {
		let expr = mExp;
		const symbolObj = { '×': '*', '÷': '/' };
		Object.keys(symbolObj).forEach(symbol => {
			expr = expr.replace(new RegExp(symbol, 'gi'), symbolObj[symbol]);
		});
		try {
			msg.send(`🔢  ::  Your expression evaluates to \`${math.eval(expr)}\`.`);
		} catch (err) {
			throw [
				`<:error:508595005481549846>  ::  I would love to evaluate **${mExp}** but my magical calculator says it gave an error:`,
				`\`\`\`js\n${err.name}: ${err.message}\n\`\`\``
			].join('\n');
		}
	}

	async init() {
		try {
			math.import({
				import: () => { throw new Error('Function import is disabled'); },
				createUnit: () => { throw new Error('Function createUnit is disabled'); },
				parse: () => { throw new Error('Function parse is disabled'); },
				derivative: () => { throw new Error('Function derivative is disabled'); }
			}, { override: true });
		} catch (err) {
			return;
		}
	}

};
