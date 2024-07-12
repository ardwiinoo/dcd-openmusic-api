require('dotenv').config()

const config = {
    app: {
        port: process.env.PORT,
        host: process.env.HOST,
    },
    security: {
        hash: {
            saltRounds: parseInt(process.env.SALT_ROUNDS)
        },
        jwt: {

        }
    }
}

module.exports = config