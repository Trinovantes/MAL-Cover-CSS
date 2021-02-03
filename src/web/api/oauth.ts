import express from 'express'
import crypto from 'crypto'
import dayjs from 'dayjs'
import createHttpError from 'http-errors'

import Constants from '@common/Constants'
import { isOauthState } from '@api/interfaces/Session'
import { RedirectResponse } from '@api/interfaces/Responses'
import { isLoginRequest } from '@api/interfaces/Requests'
import { enforceUserIsLoggedIn, logout } from '@api/middleware/user'
import { fetchMalUser, getAuthEndpoint, isOauthAuthSuccess, isOauthFailure, obtainAccessToken } from '@common/MyAnimeList'
import { User } from '@common/models/User'
import { getHost, hasField } from '@common/utils'
import { createLogger } from '@common/utils/logger'

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

const oauthRouter = express.Router()
export default oauthRouter

// ----------------------------------------------------------------------------
// Login
// ----------------------------------------------------------------------------

oauthRouter.post('/login', function(req, res, next) {
    if (!isLoginRequest(req.body)) {
        return next(new createHttpError.BadRequest())
    }

    req.session.oauthState = {
        secret: crypto.randomBytes(Constants.MAL_OAUTH_RANDOM_STATE_LENGTH).toString('hex'),
        restorePath: req.body.restorePath || '',
    }

    const url = getAuthEndpoint(req.session.oauthState)
    const redirect: RedirectResponse = { url }
    return res.status(200).json(redirect)
})

// ----------------------------------------------------------------------------
// Logout
// ----------------------------------------------------------------------------

oauthRouter.post('/logout', enforceUserIsLoggedIn, function(req, res) {
    void (async() => {
        await logout(req, res)

        const redirect: RedirectResponse = { url: '/' }
        return res.status(200).json(redirect)
    })()
})

// ----------------------------------------------------------------------------
// Oauth Response
// ----------------------------------------------------------------------------

const logger = createLogger('oauth')

oauthRouter.get('/', function(req, res) {
    const malAuth = req.query

    const onError = (redirect?: string) => {
        req.session.oauthState = undefined
        req.session.currentUser = undefined
        req.session.error = { errorMessage: 'Failed to log in with MyAnimeList.net' }
        res.redirect(redirect || '/')
    }

    if (!hasField(malAuth, 'state', 'string')) {
        logger.warn('No state in malAuth:%s', malAuth)
        return onError()
    }

    // Check if returned state is valid
    // The secret in returned state must match the secret we stored in session when we initiated the oauth flow
    // Otherwise, the state might be forged and we reject it
    const encodedState = malAuth.state as string
    const returnedState = JSON.parse(decodeURIComponent(encodedState)) as unknown
    if (!isOauthState(returnedState)) {
        logger.warn('Malformed oauth state in malAuth:%s', malAuth)
        return onError()
    }

    if (returnedState.secret !== req.session.oauthState?.secret) {
        logger.warn('Mismatch oauth secret returnedState:%s session.oauthState:%s', returnedState.secret, req.session.oauthState?.secret)
        return onError()
    }

    // Valid response from MAL
    if (!isOauthAuthSuccess(malAuth)) {
        if (isOauthFailure(malAuth)) {
            // Example: user manually declined request
            logger.warn('Failed to authenticate:%s', malAuth.message)
        } else {
            // Unexpected object in query (e.g. user manually visiting this endpoint)
            logger.warn('Unexpected malAuth:%s', malAuth)
        }

        return onError(returnedState.restorePath)
    }

    // Get access token and then get user info
    void (async() => {
        try {
            const redirectUrl = `${getHost()}/${Constants.MAL_OAUTH_REDIRECT_URL}`
            const malOauth = await obtainAccessToken(malAuth.code, returnedState.secret, redirectUrl)
            const malUser = await fetchMalUser(malOauth.access_token, malOauth.refresh_token)
            const tokenExpires = dayjs().add(malOauth.expires_in, 'second')

            const [user, created] = await User.upsert({
                malUserId: malUser.id,
                malUsername: malUser.name,
                tokenExpires: tokenExpires.toDate(),
                accessToken: malOauth.access_token,
                refreshToken: malOauth.refresh_token,
            })

            logger.verbose(`${created ? 'Created' : 'Updated'} user ${user.malUsername}`)
            req.session.currentUser = {
                malUserId: user.malUserId,
                malUsername: user.malUsername,
                lastChecked: user.lastChecked,
            }

            return res.redirect('/settings')
        } catch (err) {
            const error = err as Error
            logger.warn('Failed to get user information and update database (%s:%s)', error.name, error.message)
            logger.debug(error.stack)
            return onError(returnedState.restorePath)
        }
    })()
})
