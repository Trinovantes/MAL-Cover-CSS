import axios, { AxiosRequestConfig } from 'axios'
import { LoginRequest } from '@/common/schemas/LoginRequest'
import { RedirectResponse, SuccessResponse, UserResponse } from '@/common/schemas/ApiResponse'

// ----------------------------------------------------------------------------
// Api Helpers
// ----------------------------------------------------------------------------

async function callApi<T>(endpoint: string, config: AxiosRequestConfig, validator?: (obj: unknown) => obj is T): Promise<T> {
    const url = `${window.location.origin}/api/${endpoint}`

    console.info('Fetching', url, config)
    const apiResponse = await axios(url, config)

    if (validator && !validator(apiResponse.data)) {
        console.info('Unexpected response from API', apiResponse.data)
        throw new Error('Unexpected response from API')
    }

    return apiResponse.data as T
}

async function fetchLoginRedirect(restorePath: string): Promise<string> {
    const loginRequest: LoginRequest = { restorePath }
    const config: AxiosRequestConfig = {
        method: 'POST',
        data: loginRequest,
    }

    const response = await callApi<RedirectResponse>('oauth/login', config)
    return response.url
}

async function fetchLogoutRedirect(): Promise<string> {
    const config: AxiosRequestConfig = {
        method: 'POST',
    }

    const response = await callApi<RedirectResponse>('oauth/logout', config)
    return response.url
}

export async function fetchUser(): Promise<UserResponse> {
    const config: AxiosRequestConfig = {
        method: 'GET',
    }

    const response = await callApi<UserResponse>('settings/user', config)
    return response
}

export async function fetchDeleteUser(): Promise<SuccessResponse> {
    const config: AxiosRequestConfig = {
        method: 'DELETE',
    }

    const response = await callApi<SuccessResponse>('settings/user', config)
    return response
}

// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------

export async function login(restorePath: string): Promise<void> {
    try {
        const url = await fetchLoginRedirect(restorePath)
        window.location.href = url
    } catch (err) {
        console.warn('Failed to log in')
        console.warn(err)
    }
}

export async function logout(): Promise<void> {
    try {
        const url = await fetchLogoutRedirect()
        window.location.href = url
    } catch (err) {
        console.warn('Failed to log out')
        console.warn(err)
    }
}
