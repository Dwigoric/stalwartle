const { Argument } = require('@sapphire/framework');

module.exports = class extends Argument {

    constructor(context, options) {
        super(context, {
            ...options,
            name: 'piece'
        });
    }

    run(parameter, context) {
        for (const stores of this.container.stores.values()) {
            for (const storePiece of stores.values()) {
                const piece = storePiece.store.get(parameter);
                if (piece) return this.ok(piece);
            }
        }
        return this.error({
            parameter,
            context,
            identifier: 'InvalidPiece',
            message: 'An invalid piece name was provided.'
        });
    }

};
