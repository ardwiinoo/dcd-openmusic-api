const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

// exception
const { ClientError } = require('./exceptions')

// plugin
const { 
    albums, 
    authentications,
    collaborations,
    _exports,
    likes,
    playlists,
    songs,
    uploads,
    users
} = require('./api') 

// service
const { 
    AlbumsService,
    AlbumLikesService,
    AuthenticationsService,
    CollaborationsService,
    PlaylistsService,
    SongsService,
    UsersService, 
} = require('./services/postgres') 
const ProducerService = require('./services/rabbitmq/ProducerService')
const StorageService = require('./services/storage/StorageService')
const CacheService = require('./services/redis/CacheService')

// utility
const config = require('./utils/config')
const { onClientErrorResponse, onServerErrorResponse } = require('./utils/responses')

// tokenize
const TokenManager = require('./tokenize/TokenManager')

// validator
const { 
    AlbumsValidator,
    AuthenticationsValidator,
    CollaborationsValidator,
    ExportsValidator,
    PlaylistsValidator,
    SongsValidator,
    UploadsValidator,
    UsersValidator
} = require('./validator')

const init = async () => {
    const cacheService = new CacheService()
    const songsService = new SongsService()
    const albumsService = new AlbumsService(songsService)
    const usersService = new UsersService()
    const authenticationsService = new AuthenticationsService()
    const collaborationsService = new CollaborationsService(usersService)
    const playlistsService = new PlaylistsService(collaborationsService, songsService)
    const albumlikesService = new AlbumLikesService(albumsService, cacheService)
    const storageService = new StorageService(path.resolve(__dirname, './api/uploads/file/images'))

    const server = Hapi.server({
        port: config.app.port,
        host: config.app.host,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt
        },
        {
            plugin: Inert
        }
    ])

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: config.security.jwt.accessTokenKey,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: config.security.jwt.accessTokenAgeSec,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
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
        },
        {
            plugin: authentications,
            options: {
                usersService,
                authenticationsService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator
            }
        },
                {
            plugin: collaborations,
            options: {
                collaborationsService: collaborationsService,
                playlistsService: playlistsService,
                validator: CollaborationsValidator
            }
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator
            }
        },
        {
            plugin: _exports,
            options: {
                playlistsService,
                producerService: ProducerService,
                validator: ExportsValidator
            }
        },
        {
            plugin: uploads,
            options: {
                albumsService,
                storageService,
                validator: UploadsValidator
            }
        },
        {
            plugin: likes,
            options: {
                service: albumlikesService
            }
        }
    ])

    server.ext('onPreResponse', (request, h) => {
        const { response } = request

        if (response instanceof Error) {
            if (response instanceof ClientError) {
                return onClientErrorResponse(response, h)
            }

            if (!response.isServer) {
                return onClientErrorResponse(response, h)
            }

            return onServerErrorResponse(response, h)
        }

        return h.continue
    })
    
    await server.start()
    console.log(`Server running on ${server.info.uri}`)
}

init()
