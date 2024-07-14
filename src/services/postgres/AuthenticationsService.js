const { Pool } = require("pg");
const { InvariantError } = require("../../exceptions");

class AuthenticationsService {
    constructor() {
        this._pool = new Pool()
    }

    async addRefreshToken(refreshToken) {
        const query = {
            text: 'INSERT INTO authentications (token) VALUES ($1)',
            values: [refreshToken]
        }

        await this._pool.query(query)
    }

    async verifyRefreshToken(payload) {
        const { refreshToken } = payload

        const query = {
            text: 'SELECT token FROM authentications WHERE token = $1',
            values: [refreshToken]
        }

        const { rowCount } = await this._pool.query(query)
        
        if (!rowCount) {
            throw new InvariantError('Refresh token tidak valid')
        }
    }

    async deleteRefreshToken(payload) {
        const { refreshToken } = payload

        const query = {
            text: 'DELETE FROM authentications WHERE token = $1',
            values: [refreshToken]
        }

        await this._pool.query(query)
    }
}

module.exports = AuthenticationsService