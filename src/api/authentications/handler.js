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

    _generateJwtToken(id) {
        return {
            accessToken: this._tokenManager.generateAccessToken({ id }),
            refreshToken: this._tokenManager.generateRefreshToken({ id }),
        }
    }

}

module.exports = AuthenticationsHandler