export default {
    IS_SSR: (typeof window === 'undefined'),

    APP_NAME: 'MAL Cover CSS',
    APP_DESC: 'Automatically generate CSS to insert cover images into your MyAnimeList.net profile',

    MAL_OAUTH_URL: 'https://myanimelist.net/v1',
    MAL_API_URL: 'https://api.myanimelist.net/v2',
    MAL_OAUTH_REDIRECT_URL: 'api/oauth',
    MAL_OAUTH_RANDOM_STATE_LENGTH: 32,

    DELAY_BETWEEN_REQUESTS: 200, // ms
    DELAY_BETWEEN_SCRAPPING: 24, // hours
    ITEMS_PER_LIST_REQUEST: 100, // 100 max

    COOKIE_DURATION: 7, // days
    ENCRYPTION_ALGORITHM: 'aes-256-gcm',
    ENCRYPTION_KEY_LENGTH: 32, // bytes
    ENCRYPTION_IV_LENGTH: 12, // bytes
    ENCRYPTION_AUTH_TAG_LENGTH: 16, // bytes
}
