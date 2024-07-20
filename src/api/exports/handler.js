const autoBind = require('auto-bind')
const { onSuccessResponse } = require('../../utils/responses')

class ExportsHandler {
    constructor(playlistsService, producerService, validator) {
        this._playlistsService = playlistsService
        this._producerService = producerService
        this._validator = validator

        autoBind(this)
    }

    async postExportPlaylistHandler(request, h) {
        const { id: userId } = request.auth.credentials
        const { id: playlistId } = request.params

        this._validator.validateExportPlaylistPayload(request.payload)
        await this._playlistsService.verifyPlaylistOwner(playlistId, userId)

        const message = { userId, playlistId, targetEmail: request.payload.targetEmail }
        await this._producerService.sendMessage('export:playlist', JSON.stringify(message))

        return onSuccessResponse(h, { message: 'Permintaan Anda sedang kami proses', statusCode: 201 })
    }
}

module.exports = ExportsHandler