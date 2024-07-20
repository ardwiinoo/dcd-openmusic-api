const { Pool } = require('pg')
const autoBind = require('auto-bind')
const { nanoid } = require('nanoid')
const { InvariantError, NotFoundError } = require('../../exceptions')

class AlbumLikesService {
    constructor(albumsService, cacheService) {
        this._pool = new Pool
        this._albumsService = albumsService
        this._cacheService = cacheService

        autoBind(this)
    }

    async addLike(albumId, userId) {
        const id = `like-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
            values: [id, userId, albumId]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new InvariantError('Album like gagal ditambahkan')
        }

        await this._cacheService.delete(`likes:${albumId}`)
        return rows[0].id
    }

    async getLikes(albumId) {
        const cacheKey = `likes:${albumId}`
        
        try {
            const cachedResult = await this._cacheService.get(cacheKey)
            return {
                cached: true,
                likes: JSON.parse(cachedResult),
            }
        } catch (error) {
            if (error.message !== 'Cache tidak ditemukan') {
                throw error
            }

            const query = {
                text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            }

            const { rowCount } = await this._pool.query(query)

            if (!rowCount) {
                throw new NotFoundError('Album tidak ditemukan')
            }

            await this._cacheService.set(cacheKey, JSON.stringify(rowCount))
            return {
                likes: rowCount,
                cached: false,
            }
        }
    }

    async deleteLike(albumId, userId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        }

        const { rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Gagal menghapus, Id tidak ditemukan')
        }

        this._cacheService.delete(`likes:${albumId}`)
    }

    async verifyLikeUser(albumId, userId) {
        await this._albumsService.getAlbumById(albumId)

        const query = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
            values: [albumId, userId],
        }

        const { rowCount } = await this._pool.query(query)

        if (rowCount > 0) {
            throw new InvariantError('Anda sudah menyukai album ini')
        }
    }
}

module.exports = AlbumLikesService