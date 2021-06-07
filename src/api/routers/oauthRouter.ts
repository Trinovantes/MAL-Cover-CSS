import express from 'express'
import crypto from 'crypto'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { isLoginRequest } from '@/common/schemas/LoginRequest'
import { RedirectResponse } from '@/common/schemas/ApiResponse'
import { MAL_OAUTH_RANDOM_STATE_LENGTH } from '@/common/Constants'
import { getOauthEndpoint, obtainAccessToken } from '@/common/MyAnimeList/oauth'
import { clearSession, enforceUserIsLoggedIn } from '@/api/middleware/user'
import { isOauthState } from '@/common/schemas/OauthState'
import { User } from '@/api/models/User'
import { fetchMalUser } from '@/common/MyAnimeList/data'
import { createAsyncHandler } from '@/api/utils/asyncHandler'
import { isOauthAuthSuccess } from '@/common/schemas/OauthSuccess'
import { isOauthFailure } from '@/common/schemas/OauthFailure'
import { getSqlTimestamp } from '@/api/utils/getSqlTimestamp'
import { getSecret, Secrets } from '@/common/utils/secrets'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export const oauthRouter = express.Router()

// ----------------------------------------------------------------------------
// Login
// ----------------------------------------------------------------------------

oauthRouter.post('/login', (req, res, next) => {
    if (!isLoginRequest(req.body)) {
        return next(new createHttpError.BadRequest())
    }

    req.session.oauthState = {
        secret: crypto.randomBytes(MAL_OAUTH_RANDOM_STATE_LENGTH).toString('hex'),
        restorePath: req.body.restorePath || '',
    }

    const url = getOauthEndpoint(req.session.oauthState)
    const redirect: RedirectResponse = { url }
    res.status(200)
    res.json(redirect)
})

// ----------------------------------------------------------------------------
// Logout
// ----------------------------------------------------------------------------

oauthRouter.post('/logout', enforceUserIsLoggedIn, createAsyncHandler(async(req, res) => {
    console.info(`Logout ${res.locals.currentUser?.toString()}`)
    await clearSession(req, res)

    const redirect: RedirectResponse = { url: '/' }
    res.status(200)
    res.json(redirect)
}))

// ----------------------------------------------------------------------------
// Oauth Response
// ----------------------------------------------------------------------------

export function getOauthRedirectUrl(): string {
    return `${getSecret(Secrets.HOST_URL)}/api/oauth`
}

oauthRouter.get('/', createAsyncHandler(async(req, res) => {
    const onError = async(redirect?: string) => {
        await clearSession(req, res)
        res.redirect(redirect ?? '/')
    }

    const malAuth = req.query
    const encodedState = malAuth.state as string
    const returnedState = JSON.parse(decodeURIComponent(encodedState)) as unknown

    // Check if returned state is valid
    if (!isOauthState(returnedState)) {
        console.info('Malformed oauth state in malAuth', malAuth)
        await onError()
        return
    }

    // The secret in returned state must match the secret we stored in session when we initiated the oauth flow
    // Otherwise, the state might be forged and we reject it
    if (returnedState.secret !== req.session.oauthState?.secret) {
        console.info(`Mismatch oauth secret returnedState:${returnedState.secret} session.oauthState:${req.session.oauthState?.secret}`)
        await onError()
        return
    }

    // Valid response from MAL
    if (!isOauthAuthSuccess(malAuth)) {
        if (isOauthFailure(malAuth)) {
            // Example: user manually declined request
            console.info('Failed to authenticate', malAuth)
        } else {
            // Unexpected object in query (e.g. user manually visiting this endpoint)
            console.info('Unexpected malAuth', malAuth)
        }

        await onError(returnedState.restorePath)
        return
    }

    const redirectUrl = getOauthRedirectUrl()
    const malOauth = await obtainAccessToken(malAuth.code, returnedState.secret, redirectUrl)
    const malUser = await fetchMalUser(malOauth.access_token)
    const tokenExpires = getSqlTimestamp(dayjs().add(malOauth.expires_in, 'seconds').toDate())

    const user = await User.upsert({
        malUserId: malUser.id,
        malUsername: malUser.name,
        tokenExpires: tokenExpires,
        accessToken: malOauth.access_token,
        refreshToken: malOauth.refresh_token,
    })

    console.info(`Upserted user ${malUser.name}`)
    req.session.currentUser = user.toSessionData()

    res.redirect('/settings')
}))
