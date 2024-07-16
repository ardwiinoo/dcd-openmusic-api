const { InvariantError } = require('../../exceptions')
const { CollaborationSchemaPayload } = require('./schema')

const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = CollaborationSchemaPayload.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

module.exports = CollaborationsValidator