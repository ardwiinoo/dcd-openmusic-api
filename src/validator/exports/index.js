const { InvariantError } = require('../../exceptions')
const { ExportPlaylistPayloadSchema } = require('./schema')

const ExportsValidator = {
    validateExportPlaylistPayload: (payload) => {
        const validationResult = ExportPlaylistPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = ExportsValidator