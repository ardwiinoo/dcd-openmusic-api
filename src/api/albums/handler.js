const autoBind = require('auto-bind')
const { handleSuccess } = require('../../utils/responses')

class AlbumHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload)
        const albumId = await this._service.addAlbum(request.payload)

        return handleSuccess(h, { data: { albumId }, statusCode: 201 })
    }
}

module.exports = AlbumHandler