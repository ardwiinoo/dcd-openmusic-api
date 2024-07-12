const Hapi = require('@hapi/hapi')

// exception
const { ClientError } = require('./exceptions')

// plugin
const albums = require('./api/albums')
const songs = require('./api/songs')
const users = require('./api/users')

// service
const AlbumsService = require('./services/postgres/AlbumsService')
const SongsService = require('./services/postgres/SongsService')
const UsersService = require('./services/postgres/UsersService')

// utility
const config = require('./utils/config')
const { onClientErrorResponse, onServerErrorResponse } = require('./utils/responses')

// validator
const AlbumsValidator = require('./validator/albums')
const SongsValidator = require('./validator/songs')
const UsersValidator = require('./validator/users')

const init = async () => {
    const songsService = new SongsService()
    const albumsService = new AlbumsService(songsService)
    const usersService = new UsersService()

    const server = Hapi.server({
        port: config.app.port,
        host: config.app.host,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                validator: AlbumsValidator,
            }
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator
            }
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator
            }
        }
    ])

    server.ext('onPreResponse', (request, h) => {
        const { response } = request

        if (response instanceof Error) {
            if (response instanceof ClientError) {
                return onClientErrorResponse(response, h);
            } else {
                return onServerErrorResponse(response, h);
            }
        }

        return h.continue
    })
    
    await server.start()
    console.log(`Server running on ${server.info.uri}`)
}

init()
