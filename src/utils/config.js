require('dotenv').config()

const config = {
    app: {
        port: process.env.PORT,
        host: process.env.HOST,
    },
}

module.exports = config