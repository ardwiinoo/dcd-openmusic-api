const { Pool } = require('pg')
const { InvariantError, AuthenticationError, NotFoundError } = require('../../exceptions')
const { nanoid } = require('nanoid')
const { hashPassword, comparePassword } = require('../../utils/hash')

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

    async verifyUserCredentials(payload) {
        const { username, password } = payload

        const query = {
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username]
        }

        const { rows, rowCount } = await this._pool.query(query)
        
        if (!rowCount) {
            throw new AuthenticationError('Gagal authentikasi, kredensial salah')
        }

        const user = rows[0]
        const match = await comparePassword(password, user.password);
 
        if (!match) {
            throw new AuthenticationError('Gagal authentikasi, kredensial salah')
        }

        return user.id
    }

    async getUserById(id) {
        const query = {
            text: 'SELECT * FROM users WHERE id = $1',
            values: [id],
        }

        const { rows, rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError('User tidak ditemukan');
        }

        return rows[0]
    }
}

module.exports = UsersService