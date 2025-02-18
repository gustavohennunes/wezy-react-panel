import axios from 'axios'
import * as authHelper from '../auth/_helpers'
const CAYMAN_API_URL = import.meta.env.VITE_CAYMAN_API_URL
//export const CAYMAN_URL_API = `${CAYMAN_API_URL}`;

const localAuth = authHelper.getLocalAuth()

export const api = axios.create({
    baseURL: CAYMAN_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Customer-Host': 'douglasfeuse',
        Authorization: `Bearer ${localAuth}`,
    },
})
