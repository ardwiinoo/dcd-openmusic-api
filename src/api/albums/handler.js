const autoBind = require('auto-bind')
const { onSuccessResponse } = require('../../utils/responses')

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload)
        const albumId = await this._service.addAlbum(request.payload)

        return onSuccessResponse(h, { data: { albumId }, statusCode: 201 })
    }

    async getAlbumDetailHandler(request, h) {
        const { id } = request.params
        const album = await this._service.getAlbumById(id)
        
        return onSuccessResponse(h, { data: { album }})
    }

    async putAlbumHandler(request, h) {
        const { id } = request.params
        this._validator.validateAlbumPayload(request.payload)
        await this._service.updateAlbum({...request.payload, id})
        
        return onSuccessResponse(h, { message: 'Album berhasil diperbarui' })
    }

    async deleteAlbumHandler(request, h) {
        const { id } = request.params
        await this._service.deleteAlbum(id)

        return onSuccessResponse(h, { message: 'Album berhasil dihapus'})
    }
}

module.exports = AlbumsHandler