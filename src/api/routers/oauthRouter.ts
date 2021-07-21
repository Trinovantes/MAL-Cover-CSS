import express from 'express'
import crypto from 'crypto'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'
import { isLoginRequest } from '@/common/schemas/LoginRequest'
import { RedirectResponse } from '@/common/schemas/ApiResponse'
import { MAL_OAUTH_RANDOM_STATE_LENGTH } from '@/common/Constants'
import { getOauthEndpoint, obtainAccessToken } from '@/common/services/MyAnimeList/oauth'
import { clearSession, enforceUserIsLoggedIn } from '@/api/middleware/user'
import { isOauthState } from '@/common/schemas/OauthState'
import { User } from '@/common/models/User'
import { fetchMalUser } from '@/common/services/MyAnimeList/data'
import { createAsyncHandler } from '@/api/utils/asyncHandler'
import { isOauthAuthSuccess } from '@/common/services/MyAnimeList/schemas/OauthAuthSuccess'
import { isOauthFailure } from '@/common/services/MyAnimeList/schemas/OauthFailure'
import { getSqlTimestamp } from '@/common/utils/getSqlTimestamp'
import { getOauthRedirectUrl } from '@/common/utils/secrets'

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

oauthRouter.get('/', createAsyncHandler(async(req, res) => {
    const onError = async(redirect?: string) => {
        await clearSession(req, res)
        res.redirect(redirect ?? '/')
    }

    const urlQuery = req.query

    // Check if state exists in query
    const encodedState = urlQuery.state
    if (typeof encodedState !== 'string') {
        console.info('Invalid oauth state', urlQuery)
        await onError()
        return
    }

    // Check if returned state is valid
    const returnedState = JSON.parse(decodeURIComponent(encodedState)) as unknown
    if (!isOauthState(returnedState)) {
        console.info('Malformed oauth state in urlQuery', urlQuery)
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

    // Oauth failure (e.g. user decline request)
    if (isOauthFailure(urlQuery)) {
        console.info('Failed to get access token', urlQuery)
        await onError(returnedState.restorePath)
        return
    }

    // Check if oauth was successful
    if (!isOauthAuthSuccess(urlQuery)) {
        console.info('Unexpected urlQuery', urlQuery)
        await onError(returnedState.restorePath)
        return
    }

    const redirectUrl = getOauthRedirectUrl()
    const malOauth = await obtainAccessToken(urlQuery.code, returnedState.secret, redirectUrl)
    const malUser = await fetchMalUser(malOauth.access_token)
    const tokenExpires = getSqlTimestamp(dayjs.utc().add(malOauth.expires_in, 'seconds').toDate())

    const user = await User.upsert({
        malUserId: malUser.id,
        malUsername: malUser.name,
        tokenExpires: tokenExpires,
        accessToken: malOauth.access_token,
        refreshToken: malOauth.refresh_token,
    })

    console.info(`Upserted user ${malUser.name}`)
    req.session.currentUser = user.toSessionData()
    req.session.oauthState = undefined
    res.redirect('/settings')
}))
