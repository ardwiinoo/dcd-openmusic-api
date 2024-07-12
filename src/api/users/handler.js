const autoBind = require('auto-bind')
const { onSuccessResponse } = require('../../utils/responses')

class UsersHandler {
    constructor(service, validator) {
        this._service = service
        this._vaidator = validator

        autoBind(this)
    }

    async postUserHandler(request, h) {
        this._vaidator.validateUserPayload(request.payload)
        const userId = await this._service.addUser(request.payload)

        return onSuccessResponse(h, { data: { userId }, statusCode: 201 })
    }
}

module.exports = UsersHandler