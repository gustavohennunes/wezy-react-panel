import axios from 'axios'
import * as authHelper from '../auth/_helpers'

const CAYMAN_API_URL = import.meta.env.VITE_CAYMAN_API_URL
const CUSTOMER_HOST = import.meta.env.VITE_CUSTOMER_HOST

const api = axios.create({
    baseURL: CAYMAN_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Customer-Host': CUSTOMER_HOST,
    },
})

authHelper.setupAxios(api)

export { api }
