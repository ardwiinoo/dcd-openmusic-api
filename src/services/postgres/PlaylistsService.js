const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const { InvariantError, NotFoundError, AuthorizationError } = require('../../exceptions')

class PlaylistsService {
    constructor(songsService) {
        this._pool = new Pool
        this._songsService = songsService
    }

    async addPlaylist(payload) {
        const { owner, name } = payload
        const id = `playlist-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, owner]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if(!rowCount) {
            throw new InvariantError('Playlist gagal ditambahkan')
        }

        return rows[0].id
    }

    async getPlaylists(userId) {
        const query = {
            text: 'SELECT p.id, p.name, u.username FROM playlists AS p INNER JOIN users AS u ON p.owner = u.id WHERE u.id = $1',
            values: [userId]
        }

        const { rows } = await this._pool.query(query)

        return rows
    }

    async _getPlaylistById(id) {
        const query = {
            text: 'SELECT p.id, p.name, u.username FROM playlists AS p INNER JOIN users AS u ON p.owner = u.id WHERE p.id = $1',
            values: [id]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        return rows[0]
    }

    async verifyPlaylistOwner(id, userId) {
        const query = {
            text: 'SELECT owner FROM playlists WHERE id = $1',
            values: [id]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const { owner: ownerId } = rows[0]

        if (ownerId !== userId) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
        }
    }

    async deletePlaylist(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id]
        }

        const { rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Gagal menghapus, Id playlist tidak ditemukan')
        }
    }

    async addSongToPlaylist(payload) {
        const { playlistId, songId } = payload
        const id = `playlistSong-${nanoid(16)}`
        await this._songsService.getSongById(songId)

        const query = {
            text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new InvariantError('Playlist song gagal ditambahkan')
        }

        return rows[0].id
    }

    async verifyPlaylistAccess(id, userId) {
        return this.verifyPlaylistOwner(id, userId)
            .catch(error => {
                if (error instanceof NotFoundError) {
                    throw error
                }
            })
    }

    async getPlaylistSongs(id) {
        const playlist = await this._getPlaylistById(id)
        const query = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM songs JOIN playlist_songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1',
            values: [id],
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Song tidak ditemukan')
        }

        const songs = rows

        return {
            playlist: {
                ...playlist,
                songs
            }
        }
    }

    async deletePlaylistSong(payload) {
        const { playlistId, songId } = payload

        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        }

        const { rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new InvariantError('Song pada playlist gagal dihapus')
        }
    }
}

module.exports = PlaylistsService