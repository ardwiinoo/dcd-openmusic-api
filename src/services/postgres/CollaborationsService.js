const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const { InvariantError, NotFoundError } = require("../../exceptions");

class CollaborationsService {
    constructor(usersService) {
        this._pool = new Pool()
        this._usersService = usersService
    }

    async addCollaborator(payload) {
        const { playlistId, userId } = payload

        await this._usersService.getUserById(userId)
        const id = `collab-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId]
        }

        const { rows, rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new InvariantError('Collaboration gagal ditambahkan')
        }

        return rows[0].id
    }

    async deleteCollaboration(payload) {
        const { playlistId, userId } = payload

        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId],
        }

        const { rowCount } = await this._pool.query(query)

        if (!rowCount) {
            throw new NotFoundError('Gagal menghapus, Id playlist atau user tidak ditemukan')   
        }
    }

    async verifyCollaborator(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId],
        }

        const { rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError( 'Collaborator tidak ditemukan')
        }
    }
}

module.exports = CollaborationsService