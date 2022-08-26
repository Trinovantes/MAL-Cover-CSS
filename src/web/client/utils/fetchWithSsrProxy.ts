import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { AppContext } from '@/web/AppContext'
import { useRequestHeaders } from './useRequestHeaders'

export async function fetchWithSsrProxy<T>(appContext: AppContext | undefined, url: string, config: AxiosRequestConfig = { method: 'get' }): Promise<AxiosResponse<T>> {
    const res = await axios(url, {
        ...config,
        headers: useRequestHeaders(appContext),
    })

    if (DEFINE.IS_SSR) {
        if (!appContext) {
            throw new Error('Invalid appContext')
        }

        appContext.cookieHeaders = res.headers['set-cookie']
    }

    return res as AxiosResponse<T>
}
