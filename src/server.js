const Hapi = require('@hapi/hapi')

// exception
const { ClientError } = require('./exceptions')

// plugin
const albums = require('./api/albums')
const songs = require('./api/songs')

// service
const AlbumsService = require('./services/postgres/AlbumsService')
const SongsService = require('./services/postgres/SongsService')

// utility
const config = require('./utils/config')
const { onClientErrorResponse, onServerErrorResponse } = require('./utils/responses')

// validator
const AlbumsValidator = require('./validator/albums')
const SongsValidator = require('./validator/songs')

const init = async () => {
    const songsService = new SongsService()
    const albumsService = new AlbumsService(songsService)

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
