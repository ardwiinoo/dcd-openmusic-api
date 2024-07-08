const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const { InvariantError } = require('../../exceptions')

class AlbumsService {
    constructor() {
        this._pool = new Pool()
    }

    async addAlbum(payload) {
        const { name, year } = payload
        const id = `album-${nanoid(16)}`
        const createdAt = new Date()
        const updatedAt = new Date()

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, createdAt, updatedAt]
        }

        const result = await this._pool.query(query)

        if(!result.rowCount) {
            throw new InvariantError('Gagal menambahkan data album')
        }

        return result.rows[0].id
    }
}

module.exports = AlbumsService