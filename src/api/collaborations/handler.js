const autoBind = require('auto-bind')
const { onSuccessResponse } = require('../../utils/responses')

class CollaborationsHandler {
    constructor(collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService,
        this._playlistsService = playlistsService,
        this._validator = validator

        autoBind(this)
    }

    async postCollaborationHandler(request, h) {
        const { id: userId } = request.auth.credentials

        this._validator.validateCollaborationPayload(request.payload)
        await this._playlistsService.verifyPlaylistOwner(request.payload.playlistId, userId)
        const collaborationId = await this._collaborationsService.addCollaborator(request.payload)

        return onSuccessResponse(h, { data: { collaborationId }, statusCode: 201 })
    }

    async deleteCollaborationHandler(request, h) {
        const { id: userId } = request.auth.credentials

        this._validator.validateCollaborationPayload(request.payload)
        await this._playlistsService.verifyPlaylistOwner(request.payload.playlistId, userId)
        this._collaborationsService.deleteCollaboration(request.payload)

        return onSuccessResponse(h, { message: 'Collaborator berhasil dihapus dari playlist' })
    }
}

module.exports = CollaborationsHandler