const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

// exception
const { ClientError, AuthenticationError } = require('./exceptions')

// plugin
const { 
    albums, 
    authentications,
    collaborations,
    playlists,
    songs,
    users
} = require('./api') 

// service
const { 
    AlbumsService,
    AuthenticationsService,
    CollaborationsService,
    PlaylistsService,
    SongsService,
    UsersService, 
} = require('./services/postgres') 

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
    PlaylistsValidator,
    SongsValidator,
    UsersValidator
} = require('./validator')

const init = async () => {
    const songsService = new SongsService()
    const albumsService = new AlbumsService(songsService)
    const usersService = new UsersService()
    const authenticationsService = new AuthenticationsService()
    const collaborationsService = new CollaborationsService(usersService)
    const playlistsService = new PlaylistsService(collaborationsService, songsService)

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
    ])

    server.ext('onPreResponse', (request, h) => {
        const { response } = request

        if (response.isBoom) {
            const { statusCode } = response.output

            if (statusCode === 401 || statusCode === 403) {
                const customError = new AuthenticationError('Anda harus login untuk mengakses resource ini')
                return onClientErrorResponse(customError, h)
            }
        }

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
