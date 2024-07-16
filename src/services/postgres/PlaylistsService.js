const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const { InvariantError, NotFoundError, AuthorizationError } = require('../../exceptions')

class PlaylistsService {
    constructor(collaborationsService, songsService) {
        this._pool = new Pool
        this._collaborationsService = collaborationsService
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
            text: 'SELECT p.id, p.name, u.username FROM playlists p JOIN users u ON p.owner = u.id LEFT JOIN collaborations c ON c.playlist_id = p.id WHERE p.owner = $1 OR c.user_id = $1',
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
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const ownerId = rows[0].owner

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

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId)
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error
            }

            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId)
            } catch {
                throw error
            }
        }
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
            throw new NotFoundError('Gagal menghapus, Id playlist atau song tidak ditemukan')
        }
    }

    async addPlaylistSongActivity(payload) {
        const { playlistId, songId, userId, action } = payload
        const time = new Date().toISOString()
        const id = `playlistSongActivity-${nanoid(16)}`
        
        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, userId, action, time],
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new InvariantError('Playlist activity gagal ditambahkan')
        }

        return rows[0].id
    }

    async getPlaylistSongActivities(id) {
        const query = {
            text: 'SELECT u.username, s.title, psa.action, psa.time FROM playlist_song_activities AS psa JOIN users AS u ON u.id = psa.user_id JOIN songs AS s ON s.id = psa.song_id WHERE psa.playlist_id = $1',
            values: [id],
        }

        const { rows, rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError('Playlist activities tidak ditemukan');
        }

        return {
            playlistId: id,
            activities: rows,
        }
    }
}

module.exports = PlaylistsService