const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { InvariantError, NotFoundError } = require('../../exceptions')

class SongsService {
    constructor() {
        this._pool = new Pool()
    }

    async addSong(payload) {
        const { title, year, genre, performer, duration, albumId } = payload
        const id = `song-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO songs (id, title, year, genre, performer, duration, album_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, genre, performer, duration, albumId]
        }

        const { rows, rowCount } = await this._pool.query(query)
        
        if (!rowCount) {
            throw new InvariantError('Song gagal ditambahkan')
        }

        return rows[0].id
    }

    async getSongList(title = '', performer = '') {
        const query = {
            text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
            values: [`%${title}%`, `%${performer}%`]
        }

        const { rows, rowCount } = await this._pool.query(query)
        
        if (!rowCount) {
            throw new NotFoundError('Song tidak ditemukan')
        }

        return rows
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Song tidak ditemukan')
        }

        return {
            id: rows[0].id,
            title: rows[0].title,
            year: rows[0].year,
            performer: rows[0].performer,
            genre: rows[0].genre,
            duration: rows[0].duration,
            albumId: rows[0].album_id,
        }
    }

    async updateSong(payload) {
        const { title, year, genre, performer, duration, albumId, id } = payload
        const updateAt = new Date()
        
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, updateAt, id]
        } 

        const { rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Gagal memperbarui, Id song tidak ditemukan')
        }
    }

    async deleteSong(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id]
        }

        const { rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Gagal menghapus, Id song tidak ditemukan')
        }
    }

    async getSongByAlbumId(albumId) {
        const query = {
            text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
            values: [albumId],
        };

        const { rows, rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError('Songs tidak ditemukan');
        }

        return rows
    }
}

module.exports = SongsService