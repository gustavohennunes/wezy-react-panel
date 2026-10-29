import { getData, setData } from './LocalStorage'

// API DO SERVIDOR DO PAINEL DO USUÁRIO LOGADO (MULTI-PAINEL br-1 / us-1). O LOGIN CENTRAL (/auth/master) É SEMPRE NA API
// PADRÃO (VITE_CAYMAN_API_URL) E DEVOLVE O api_url DO SERVIDOR DO PAINEL: AS CHAMADAS SEGUINTES (MÓDULOS, MENU, LOGOUT...)
// VÃO PARA ELA. SEM api_url SALVO (LOGIN DIRETO NO PAINEL COM ?a=, ANTES DE LOGAR), VALE A PADRÃO
const API_URL_STORAGE_KEY = 'api-url'

const API_URL_PADRAO = import.meta.env.VITE_CAYMAN_API_URL

// SÓ AS APIS DA PLATAFORMA: UM VALOR QUALQUER NO localStorage NÃO PODE MANDAR O TOKEN DA SESSÃO PARA OUTRO ENDEREÇO
const apiDaPlataforma = (url) => typeof url === 'string' && /^https:\/\/api\.[a-z]{2}-\d+\.wezy\.com\.br\/api\/v1$/.test(url)

/** URL base da API para as chamadas do painel. */
const getApiUrl = () => {
    const salva = getData(API_URL_STORAGE_KEY)
    return apiDaPlataforma(salva) ? salva : API_URL_PADRAO
}

/** Grava a API devolvida pelo login central (data.api_url). Valor fora da plataforma (ou vazio) volta para a padrão. */
const setApiUrl = (url) => {
    if (apiDaPlataforma(url)) {
        setData(API_URL_STORAGE_KEY, url)
    } else {
        clearApiUrl()
    }
}

/** Logout e login direto no painel (?a=): volta para a API padrão. */
const clearApiUrl = () => {
    try {
        localStorage.removeItem(API_URL_STORAGE_KEY)
    } catch (error) {
        console.error('API URL CLEAR ERROR', error)
    }
}

export { getApiUrl, setApiUrl, clearApiUrl, API_URL_PADRAO, API_URL_STORAGE_KEY }
