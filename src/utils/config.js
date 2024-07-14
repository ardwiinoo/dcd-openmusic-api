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
            accessTokenKey: process.env.ACCESS_TOKEN_KEY,
            refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
            accessTokenAgeSec: process.env.ACCESS_TOKEN_AGE
        }
    }
}

module.exports = config