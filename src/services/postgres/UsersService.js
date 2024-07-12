const { Pool } = require('pg')
const { InvariantError } = require('../../exceptions')
const { nanoid } = require('nanoid')
const { hashPassword } = require('../../utils/hash')

class UsersService {
    constructor() {
        this._pool = new Pool
    }

    async addUser(payload) {
        const { username, password, fullname } = payload
        await this._verifyUsername(username)

        const id = `user-${nanoid(16)}`
        const hashedPassword = await hashPassword(password)

        const query = {
            text: 'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if(!rowCount) {
            throw new InvariantError('User gagal ditambahkan')
        }

        return rows[0].id
    }

    async _verifyUsername(username) {
        const query = {
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username]
        }

        const { rowCount } = await this._pool.query(query)
        
        if (rowCount > 0) {
            throw new InvariantError('User gagal ditambahkan. username sudah digunakan')
        }
    }
}

module.exports = UsersService