import axios from 'axios'
import * as authHelper from '../auth/_helpers'
import { getCustomerHost } from '@/utils/customerHost'
import {
    isSystemNotFoundError,
    notifySystemNotFound,
} from '@/utils/systemStatus'

const CAYMAN_API_URL = import.meta.env.VITE_CAYMAN_API_URL

const api = axios.create({
    baseURL: CAYMAN_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// O Customer-Host é resolvido dinamicamente a cada requisição (depende da URL/?a=)
api.interceptors.request.use((config) => {
    config.headers['Customer-Host'] = getCustomerHost()
    return config
})

// Se o backend rejeitar o host/cliente, bloqueia o app com a tela de erro
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (isSystemNotFoundError(error)) {
            notifySystemNotFound()
        }
        return Promise.reject(error)
    }
)

authHelper.setupAxios(api)

export { api }
