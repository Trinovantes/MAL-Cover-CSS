export const APP_NAME = 'MAL Cover CSS'
export const APP_DESC = 'Automatically generate CSS to add cover images to your MyAnimeList classic list designs'
export const APP_THEME_COLOR = '#2e51a2'

export const MAL_AUTHORIZE_URL = 'https://myanimelist.net/v1/oauth2/authorize'
export const MAL_TOKEN_URL = 'https://myanimelist.net/v1/oauth2/token'
export const MAL_API_URL = 'https://api.myanimelist.net/v2'
export const MAL_OAUTH_RANDOM_STATE_LENGTH = 32

export const DELAY_BETWEEN_REQUESTS = 200 // ms
export const DELAY_BETWEEN_SCRAPPING = 1 // hours
export const ITEMS_PER_LIST_REQUEST = 100 // 100 max

export const COOKIE_DURATION = 30 * 24 * 3600 * 1000 // ms
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
export const ENCRYPTION_KEY_LENGTH = 32 // bytes
export const ENCRYPTION_IV_LENGTH = 12 // bytes
export const ENCRYPTION_AUTH_TAG_LENGTH = 16 // bytes

export const DB_FILE = './db/live/malcovercss.sqlite3'
export const DB_MEMORY = ':memory:'
export const DB_MIGRATIONS_DIR = './db/migrations'

export const SENTRY_DSN = 'https://8b8ac206cace4704956e4ebeed1420a3@o504161.ingest.sentry.io/5590526'
