const Hapi = require('@hapi/hapi')

// exception
const { ClientError } = require('./exceptions')

// plugin
const albums = require('./api/albums')

// service
const AlbumsService = require('./services/postgres/AlbumsService')

// utility
const config = require('./utils/config')
const { handleClientError, handleServerError } = require('./utils/responses')

// validator
const AlbumsValidator = require('./validator/albums')

const init = async () => {
    const albumsService = new AlbumsService()

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
        }
    ])

    server.ext('onPreResponse', (request, h) => {
        const { response } = request

        if (response instanceof Error) {
            if (response instanceof ClientError) {
                return handleClientError(response, h);
            } else {
                return handleServerError(response, h);
            }
        }

        return h.continue
    })
    
    await server.start()
    console.log(`Server running on ${server.info.uri}`)
}

init()
