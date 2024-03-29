import express from 'express'
import { ServerAppContext } from '@/web/server/ServerAppContext'
import { isLoginPayload } from '@/web/server/interfaces/LoginPayload'
import { MAL_OAUTH_RANDOM_STATE_LENGTH } from '@/common/Constants'
import { fetchMalUser } from '@/common/services/MyAnimeList/data'
import { getOauthEndpoint, fetchAccessToken } from '@/common/services/MyAnimeList/oauth'
import { isOauthAuthSuccess } from '@/common/services/MyAnimeList/schemas/OauthAuthSuccess'
import { getSqlTimestampFromNow } from '@/common/utils/getSqlTimestamp'
import createHttpError from 'http-errors'
import { RedirectResponse, SuccessResponse } from '@/web/server/interfaces/ApiResponse'
import { isOauthState } from '@/web/server/interfaces/OauthState'
import { clearSession } from '@/web/server/utils/clearSession'
import { createAsyncHandler } from '@/web/server/utils/createAsyncHandler'
import crypto from 'node:crypto'
import { enforceAuth } from '@/web/server/middlewares/enforceAuth'
import { isOauthAuthFailure } from '@/common/services/MyAnimeList/schemas/OauthAuthFailure'
import { stringifyUser, upsertUser } from '@/common/db/models/User'

export function routeOauth({ db }: ServerAppContext) {
    const router = express.Router()

    router.post('/login', (req, res, next) => {
        if (!isLoginPayload(req.body)) {
            next(new createHttpError.BadRequest())
            return
        }

        req.session.oauthState = {
            secret: crypto.randomBytes(MAL_OAUTH_RANDOM_STATE_LENGTH).toString('hex'),
            restorePath: req.body.restorePath,
        }

        const url = getOauthEndpoint(req.session.oauthState, req.session.oauthState.secret)
        res.json({ url } satisfies RedirectResponse)
    })

    router.post('/logout', enforceAuth(), createAsyncHandler(async(req, res) => {
        await clearSession(req, res)
        res.json({ message: 'Successfully logged out' } satisfies SuccessResponse)
    }))

    router.get('/', createAsyncHandler(async(req, res) => {
        const urlQuery = req.query

        // Check if state exists in query
        const encodedState = urlQuery.state
        if (typeof encodedState !== 'string') {
            res.log.warn('Invalid oauth state', urlQuery)
            await clearSession(req, res)
            res.redirect('/')
            return
        }

        // Check if returned state is valid
        const returnedState = JSON.parse(decodeURIComponent(encodedState)) as unknown
        if (!isOauthState(returnedState)) {
            res.log.warn('Malformed oauth state in urlQuery', urlQuery)
            await clearSession(req, res)
            res.redirect('/')
            return
        }

        // The secret in returned state must match the secret we stored in session when we initiated the oauth flow
        // Otherwise, the state might be forged and we reject it
        if (returnedState.secret !== req.session?.oauthState?.secret) {
            res.log.warn(`Mismatch oauth secret returnedState:${returnedState.secret} session.oauthState:${req.session?.oauthState?.secret}`)
            await clearSession(req, res)
            res.redirect('/')
            return
        }

        // Oauth failure (e.g. user decline request)
        if (isOauthAuthFailure(urlQuery)) {
            res.log.warn('Failed to get access token', urlQuery)
            await clearSession(req, res)
            res.redirect(returnedState.restorePath)
            return
        }

        // Check if oauth was successful
        if (!isOauthAuthSuccess(urlQuery)) {
            res.log.warn('Unexpected urlQuery', urlQuery)
            await clearSession(req, res)
            res.redirect(returnedState.restorePath)
            return
        }

        res.log.info('Fetching access token')
        const malOauth = await fetchAccessToken(urlQuery.code, returnedState.secret)

        res.log.info('Fetching user')
        const malUser = await fetchMalUser(malOauth.access_token)

        res.log.info(`Upserting user ${malUser.name}`)
        const tokenExpires = getSqlTimestampFromNow(malOauth.expires_in)
        const user = upsertUser(db, {
            malUserId: malUser.id,
            malUsername: malUser.name,
            tokenExpires,
            accessToken: malOauth.access_token,
            refreshToken: malOauth.refresh_token,
        })

        res.log.info(`Setting session ${stringifyUser(user)}`)
        req.session.malUserId = user.malUserId
        req.session.oauthState = undefined

        res.log.info('Redirecting user to /settings')
        res.redirect('/settings')
    }))

    return router
}
