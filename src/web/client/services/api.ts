import axios from 'axios'
import { fetchWithSsrProxy } from '../utils/fetchWithSsrProxy'
import type { AppContext } from '@/web/AppContext'
import type { ErrorResponse, RedirectResponse, SuccessResponse, UserResponse } from '@/web/server/schemas/ApiResponse'
import type { LoginRequest } from '@/web/server/schemas/LoginRequest'

export async function fetchUser(appContext?: AppContext): Promise<UserResponse | null> {
    try {
        const res = await fetchWithSsrProxy<UserResponse>(appContext, `${DEFINE.APP_URL}/api/settings/user`, {
            method: 'get',
        })

        return res.data
    } catch (err) {
        if (!axios.isAxiosError(err)) {
            throw err
        }
        if (err.response?.status !== 403) {
            throw err
        }

        return null
    }
}

export async function fetchLogin(restorePath: string): Promise<RedirectResponse | ErrorResponse> {
    if (DEFINE.IS_SSR) {
        throw new Error('Should not be called by server')
    }

    try {
        const loginRequest: LoginRequest = { restorePath }
        const res = await axios.post<RedirectResponse>(`${DEFINE.APP_URL}/api/oauth/login`, loginRequest)
        return res.data
    } catch (err) {
        if (!axios.isAxiosError(err)) {
            throw err
        }
        if (!err.response) {
            throw err
        }

        return err.response.data as ErrorResponse
    }
}

export async function fetchLogout(): Promise<SuccessResponse | ErrorResponse> {
    if (DEFINE.IS_SSR) {
        throw new Error('Should not be called by server')
    }

    try {
        const res = await axios.post<SuccessResponse>(`${DEFINE.APP_URL}/api/oauth/logout`)
        return res.data
    } catch (err) {
        if (!axios.isAxiosError(err)) {
            throw err
        }
        if (!err.response) {
            throw err
        }

        return err.response.data as ErrorResponse
    }
}

export async function fetchDeleteUser(): Promise<SuccessResponse | ErrorResponse> {
    if (DEFINE.IS_SSR) {
        throw new Error('Should not be called by server')
    }

    try {
        const res = await axios.delete<SuccessResponse>(`${DEFINE.APP_URL}/api/settings/user`)
        return res.data
    } catch (err) {
        if (!axios.isAxiosError(err)) {
            throw err
        }
        if (!err.response) {
            throw err
        }

        return err.response.data as ErrorResponse
    }
}
