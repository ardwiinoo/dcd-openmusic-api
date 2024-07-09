const autoBind = require('auto-bind')
const { onSuccessResponse } = require('../../utils/responses')

class SongsHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }   

    async postSongHandler(request, h) {
        this._validator.validateSongPayload(request.payload)
        const songId = await this._service.addSong(request.payload)

        return onSuccessResponse(h, { data: { songId }, statusCode: 201 })
    }

    async getSongListHandler(request, h) {
        const { title, performer } = request.query
        const songs = await this._service.getSongList(title, performer)

        return onSuccessResponse(h, { data: { songs }})
    }

    async getSongByIdHandler(request, h) {
        const { id } = request.params
        const song = await this._service.getSongById(id)

        return onSuccessResponse(h, { data: { song } })
    }

    async putSongHandler(request, h) {
        const { id } = request.params
        this._validator.validateSongPayload(request.payload)
        await this._service.updateSong({...request.payload, id})

        return onSuccessResponse(h, { message: 'Song berhasil diperbarui' })
    }

    async deleteSongHandler(request, h) {
        const { id } = request.params
        await this._service.deleteSong(id)

        return onSuccessResponse(h, { message: 'Song berhasil dihapus'})
    }
}

module.exports = SongsHandler