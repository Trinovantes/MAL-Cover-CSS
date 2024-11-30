import { getRuntimeSecret, RuntimeSecret } from '@/common/node/RuntimeSecret'
import { RedisStore } from 'connect-redis'
import { createClient } from 'redis'

export async function createSessionStore() {
    const redisHost = getRuntimeSecret(RuntimeSecret.REDIS_HOST)
    const redisPort = getRuntimeSecret(RuntimeSecret.REDIS_PORT)
    const redisClient = createClient({
        socket: {
            host: redisHost,
            port: parseInt(redisPort),
        },
    })

    await redisClient.connect()
    return new RedisStore({ client: redisClient })
}
