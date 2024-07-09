const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: handler.postAlbumHandler,
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: handler.getAlbumDetailHandler,
    },
     {
        method: 'PUT',
        path: '/albums/{id}',
        handler: handler.putAlbumHandler,
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: handler.deleteAlbumHandler,
    }
]

module.exports = routes