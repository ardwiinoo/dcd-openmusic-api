const autoBind = require('auto-bind')
const config = require('../../utils/config')
const { onSuccessResponse } = require('../../utils/responses')

class UploadsHandler {
    constructor(albumsService, storageService, validator) {
        this._albumsService = albumsService,
        this._storageService = storageService
        this._validator = validator

        autoBind(this)
    }

    async postUploadImageHandler(request, h) {
        const { id } = request.params
        const { cover } = request.payload

        this._validator.validateImageHeaders(cover.hapi.headers)
        
        const filename = await this._storageService.writeFile(cover, cover.hapi)
        const filelocation = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`

        await this._albumsService.updateAlbumCoverImage(id, filelocation)

        return onSuccessResponse(h, { message: 'Sampul berhasil diunggah', statusCode: 201 })
    }
}

module.exports = UploadsHandler