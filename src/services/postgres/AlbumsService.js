const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const { InvariantError, NotFoundError } = require('../../exceptions')

class AlbumsService {
    constructor(songsService) {
        this._pool = new Pool(),
        this._songsService = songsService
    }

    async addAlbum(payload) {
        const { name, year } = payload
        const id = `album-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new InvariantError('Album gagal ditambahkan')
        }

        return rows[0].id
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id]
        }

    const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Album tidak ditemukan')
        }

        let album = {
            id: rows[0].id,
            name: rows[0].name,
            year: rows[0].year,
            songs: []
        }
        
        const songs = await this._songsService.getSongByAlbumId(id).catch(() => undefined)
        if(songs) {
            album.songs = songs
        }

        return album
    }

    async updateAlbum(payload) {
        const { name, year, id } = payload
        const updateAt = new Date()
        
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updateAt, id]
        } 

        const { rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Gagal memperbarui, Id album tidak ditemukan')
        }
    }

    async deleteAlbum(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id]
        }

        const { rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Gagal menghapus, Id album tidak ditemukan')
        }
    }
}

module.exports = AlbumsService