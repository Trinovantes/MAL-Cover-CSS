import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAppContext } from '@/web/AppContext'
import { useRequestHeaders } from './useRequestHeaders'

export async function fetchWithSsrProxy<T>(url: string, config: AxiosRequestConfig = { method: 'get' }): Promise<AxiosResponse<T>> {
    const appContext = useAppContext()
    const res = await axios(url, {
        ...config,
        headers: useRequestHeaders(),
    })

    if (DEFINE.IS_SSR) {
        if (!appContext) {
            throw new Error('Invalid appContext')
        }

        appContext.cookieHeaders = res.headers['set-cookie']
    }

    return res as AxiosResponse<T>
}
