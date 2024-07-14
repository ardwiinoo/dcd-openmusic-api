const Jwt = require('@hapi/jwt')
const { InvariantError } = require('../exceptions')
const config = require('../utils/config')

const TokenManager = {
    generateAccessToken: (payload) => Jwt.token.generate(payload, config.security.jwt.accessTokenKey),
    generateRefreshToken: (payload) => Jwt.token.generate(payload, config.security.jwt.refreshTokenKey),
    verifyRefreshToken: (payload) => {
        try {
            const { refreshToken } = payload
            const artifacts = Jwt.token.decode(refreshToken)
            
            Jwt.token.verifySignature(artifacts, config.security.jwt.refreshTokenKey)
            const { payload: decodedPayload } = artifacts.decoded

            return decodedPayload
        } catch {
            throw new InvariantError('Refresh token tidak valid')
        }
    }
}
 
module.exports = TokenManager