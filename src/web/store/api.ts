import axios, { AxiosRequestConfig } from 'axios'

import { LoginRequest } from '@web/api/interfaces/Requests'
import { RedirectResponse, SuccessResponse, UserResponse } from '@web/api/interfaces/Responses'
import { getHost } from '@common/utils'

async function callApi<T>(endpoint: string, config: AxiosRequestConfig, validator?: (obj: unknown) => obj is T): Promise<T> {
    const host = getHost()
    const url = `${host}/api/${endpoint}`

    console.debug('Fetching', url, config)
    const apiResponse = await axios(url, config)

    if (validator && !validator(apiResponse.data)) {
        console.debug('Unexpected response from API', apiResponse.data)
        throw new Error('Unexpected response from API')
    }

    return apiResponse.data as T
}

export async function fetchLoginRedirect(restorePath: string): Promise<string> {
    const loginRequest: LoginRequest = { restorePath }
    const config: AxiosRequestConfig = {
        method: 'POST',
        data: loginRequest,
    }

    const response = await callApi<RedirectResponse>('oauth/login', config)
    return response.url
}

export async function fetchLogoutRedirect(): Promise<string> {
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
