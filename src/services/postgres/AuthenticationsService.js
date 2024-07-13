const { Pool } = require("pg");

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
}

module.exports = AuthenticationsService