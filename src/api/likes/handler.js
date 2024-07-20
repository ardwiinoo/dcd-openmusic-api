const autoBind = require('auto-bind')
const { onSuccessResponse } = require('../../utils/responses')

class LikesHandler {
    constructor(service) {
        this._service = service

        autoBind(this)
    }

    async postAlbumLikeHandler(request, h) {
        const { id: userId } = request.auth.credentials
        const { id } = request.params

        await this._service.verifyLikeUser(id, userId)
        await this._service.addLike(id, userId)

        return onSuccessResponse(h, { message: 'Anda menyukai album ini', statusCode: 201 })
    }

    async deleteAlbumLikeHandler(request, h) {
        const { id: userId } = request.auth.credentials
        const { id } = request.params

        await this._service.deleteLike(id, userId)

        return onSuccessResponse(h, { message: 'Anda batal menyukai album ini' })
    }

    async getAlbumLikesHandler(request, h) {
        const { id } = request.params

        const { likes, cached } = await this._service.getLikes(id)

        if (cached) {
            return onSuccessResponse(h, { data: { likes }, headers: { 'X-Data-Source': 'cache' } })
        }

        return onSuccessResponse(h, { data: { likes } })
    }
}

module.exports = LikesHandler