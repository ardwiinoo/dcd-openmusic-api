const autoBind = require('auto-bind')
const { onSuccessResponse } = require('../../utils/responses')

class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator

        autoBind(this)
    }

    async postPlaylistHandler(request, h) {
        const { id: userId } = request.auth.credentials
        this._validator.validatePlaylistPayload(request.payload)

        const playlistId = await this._service.addPlaylist({ owner: userId, ...request.payload })
        
        return onSuccessResponse(h, { data: { playlistId }, statusCode: 201 })
    }

    async getPlaylistsHandler(request, h) {
        const { id: userId } = request.auth.credentials
        const playlists = await this._service.getPlaylists(userId)

        return onSuccessResponse(h, { data: { playlists } })
    }

    async deletePlaylistHandler(request, h) {
        const { id: userId } = request.auth.credentials
        const id = request.params

        await this._service.verifyPlaylistOwner(id, userId)
        await this._service.deletePlaylist(id)

        return onSuccessResponse(h, { message: 'Playlist berhasil dihapus' })
    }

    async postSongToPlaylistHandler(request, h) {
        const id = request.params
        
        this._validator.validatePlaylistSongPayload(request.payload)
        await this._service.addSongToPlaylist({ playlistId: id, ...request.payload })

        return onSuccessResponse(h, { message: 'Song berhasil ditambahkan ke dalam playlist', statusCode: 201 })
    }    

    async getListSongOnPlaylistHandler(request, h) {
        const { id: userId } = request.auth.credentials
        const id = request.params

        await this._service.verifyPlaylistAccess(id, userId)
        const playlist = await this._service.getPlaylistSongs(id)

        return onSuccessResponse(h , { data: { playlist } })
    }

    async deleteSongsOnPlaylistHandler(request, h) {
        const { id: userId } = request.auth.credentials
        const id = request.params
        
        this._validator.validatePlaylistSongPayload(request.payload)
        await this._service.verifyPlaylistAccess(id, userId)
        await this._service.deletePlaylistSong({ playlistId: id, ...request.payload })

        return onSuccessResponse(h, { message: 'Song berhasil dihapus dari playlist' })
    }
}

module.exports = PlaylistsHandler