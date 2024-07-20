const onServerErrorResponse = (error, h) => {
    console.error('Internal Server Error - ', error)

    return h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server'
    }).code(500)
}

const onClientErrorResponse = (error, h) => {
    const statusCode = error.statusCode || (error.output && error.output.statusCode) || 500

    return h.response({
        status: 'fail',
        message: error.message
    }).code(statusCode)
}

const onSuccessResponse = (h, {data = undefined, message = undefined, statusCode = 200, headers = {}}) => {
    const response = h.response({
        status: 'success',
        message,
        data
    }).code(statusCode)

    Object.keys(headers).forEach((key) => {
        response.header(key, headers[key])
    })

    return response
}

module.exports = {
    onServerErrorResponse,
    onClientErrorResponse,
    onSuccessResponse
}