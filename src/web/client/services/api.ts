import axios from 'axios'
import { fetchWithSsrProxy } from '../utils/fetchWithSsrProxy'
import type { ErrorResponse, RedirectResponse, SuccessResponse, UserResponse } from '@/web/server/schemas/ApiResponse'
import type { LoginRequest } from '@/web/server/schemas/LoginRequest'

export async function fetchLogin(restorePath: string): Promise<RedirectResponse | ErrorResponse> {
    try {
        const loginRequest: LoginRequest = { restorePath }
        const res = await fetchWithSsrProxy<RedirectResponse>(`${DEFINE.APP_URL}/api/oauth/login`, {
            method: 'post',
            data: loginRequest,
        })

        return res.data
    } catch (err) {
        return err as ErrorResponse
    }
}

export async function fetchLogout(): Promise<SuccessResponse | ErrorResponse> {
    try {
        const res = await fetchWithSsrProxy<SuccessResponse>(`${DEFINE.APP_URL}/api/oauth/logout`, {
            method: 'post',
        })

        return res.data
    } catch (err) {
        return err as ErrorResponse
    }
}

export async function fetchUser(): Promise<UserResponse | null> {
    try {
        const res = await fetchWithSsrProxy<UserResponse>(`${DEFINE.APP_URL}/api/settings/user`, {
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
    }

    return null
}

export async function fetchDeleteUser(): Promise<SuccessResponse | ErrorResponse> {
    try {
        const res = await fetchWithSsrProxy<SuccessResponse>(`${DEFINE.APP_URL}/api/settings/user`, {
            method: 'delete',
        })

        return res.data
    } catch (err) {
        return err as ErrorResponse
    }
}
