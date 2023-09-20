import { createServerApp } from '@/web/server/createServerApp'
import { DrizzleClient } from '@/common/db/createDb'
import { MemoryStore } from 'express-session'
import request from 'supertest'
import { pinoHttp } from 'pino-http'
import pino from 'pino'

type RequestBody = Parameters<request.Request['send']>[0]

export function mockApi(db: DrizzleClient) {
    const sessionStore = new MemoryStore()
    const httpLogger = pinoHttp({ logger: pino({ enabled: false }) })
    const app = createServerApp({
        trustProxy: false,
        enableCors: false,
        enableStaticFiles: false,
        enableSentry: false,
        enableVue: false,

        db,
        sessionStore,
        httpLogger,
    })

    const supertest = request(app)

    return {
        get: (url: string) => supertest.get(url),
        post: (url: string, body?: RequestBody) => supertest.post(url).send(body),
        put: (url: string) => supertest.put(url),
        delete: (url: string) => supertest.delete(url),
    }
}
