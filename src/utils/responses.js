const handleServerError = (error, h) => {
    console.error('Internal Server Error:', error);

    return h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server'
    }).code(500)
};

const handleClientError = (error, h) => {
    return h.response({
        status: 'fail',
        message: error.message
    }).code(error.statusCode);
}

const handleSuccess = (h, {data = undefined, message = undefined, statusCode = 200}) => {
    return h.response({
        status: 'success',
        message,
        data
    }).code(statusCode);
}

module.exports = {
    handleClientError,
    handleServerError,
    handleSuccess
}