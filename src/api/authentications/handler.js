const autoBind = require('auto-bind')
const { onSuccessResponse } = require('../../utils/responses')

class AuthenticationsHandler {
    constructor(usersService, authenticationsService, tokenManager, validator) {
        this._usersService = usersService
        this._authenticationsService = authenticationsService
        this._tokenManager = tokenManager
        this._validator = validator

        autoBind(this)
    }

    async postAuthHandler(request, h) {
        this._validator.validatePostAuthPayload(request.payload)
        const userId = await this._usersService.verifyUserCredentials(request.payload)

        const { accessToken, refreshToken } = this._generateJwtToken(userId)
        await this._authenticationsService.addRefreshToken(refreshToken)

        return onSuccessResponse(h, { data: { accessToken, refreshToken }, statusCode: 201 })
    }    

    async putAuthHandler(request, h) {
        this._validator.validatePutAuthPayload(request.payload)
        await this._authenticationsService.verifyRefreshToken(request.payload)

        const { id } = this._tokenManager.verifyRefreshToken(request.payload)
        const { accessToken } = this._generateJwtToken(id)

        return onSuccessResponse(h, { data: { accessToken } })
    }

    async deleteAuthHandler(request, h) {
        this._validator.validateDeleteAuthPayload(request.payload)
        await this._authenticationsService.verifyRefreshToken(request.payload)
        await this._authenticationsService.deleteRefreshToken(request.payload)

        return onSuccessResponse(h, { message: 'Refresh token berhasil dihapus'})
    }

    _generateJwtToken(id) {
        return {
            accessToken: this._tokenManager.generateAccessToken({ id }),
            refreshToken: this._tokenManager.generateRefreshToken({ id }),
        }
    }
}

module.exports = AuthenticationsHandler