const Schema = require('./Schema');

class SchemaFolder extends Schema {

	constructor(parent, key) {
		super(`${parent.path ? `${parent.path}.` : ''}${key}`);

		Object.defineProperty(this, 'parent', { value: parent });

		Object.defineProperty(this, 'key', { value: key });
	}

}

module.exports = SchemaFolder;
