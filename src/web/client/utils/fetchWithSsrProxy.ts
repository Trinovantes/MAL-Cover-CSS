import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { AppContext } from '@/web/AppContext'
import { getRequestHeaders } from './getRequestHeaders'

export async function fetchWithSsrProxy<T>(appContext: AppContext | undefined, url: string, config: AxiosRequestConfig = { method: 'get' }): Promise<AxiosResponse<T>> {
    const res = await axios(url, {
        ...config,
        headers: getRequestHeaders(appContext),
    })

    if (DEFINE.IS_SSR) {
        if (!appContext) {
            throw new Error('Invalid appContext')
        }

        appContext.cookieHeaders = res.headers['set-cookie']
    }

    return res as AxiosResponse<T>
}
