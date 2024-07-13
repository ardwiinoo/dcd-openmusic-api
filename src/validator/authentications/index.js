const { InvariantError } = require('../../exceptions');
const { PostAuthPayloadSchema } = require('./schema');

const AuthenticationsValidator = {
    validatePostAuthPayload: (payload) => {
        const validationResult = PostAuthPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}

module.exports = AuthenticationsValidator