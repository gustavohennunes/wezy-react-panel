/**
 * Sinal global de "sistema não encontrado".
 *
 * Pode ser disparado tanto por código React quanto por código comum
 * (ex.: interceptors do axios), e é observado pelo SystemProvider, que
 * substitui todo o app pela tela de "Sistema não encontrado".
 */

let systemNotFound = false
const listeners = new Set()

const isSystemNotFound = () => systemNotFound

const notifySystemNotFound = () => {
    if (systemNotFound) return
    systemNotFound = true
    listeners.forEach((listener) => listener(true))
}

const resetSystemNotFound = () => {
    if (!systemNotFound) return
    systemNotFound = false
    listeners.forEach((listener) => listener(false))
}

const subscribeSystemStatus = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

/**
 * Heurística para identificar um erro de "host/cliente inválido" vindo da API.
 *
 * ⚠️ Ajuste conforme o contrato real do backend. Hoje considera "sistema não
 * encontrado" quando a resposta é 404/422 e a mensagem menciona
 * host/sistema/cliente/customer.
 */
const isSystemNotFoundError = (error) => {
    const status = error?.response?.status
    const data = error?.response?.data
    const message = (
        data?.error?.message ||
        data?.message ||
        ''
    ).toLowerCase()

    if (status !== 404 && status !== 422) return false

    return (
        message.includes('host') ||
        message.includes('sistema') ||
        message.includes('cliente') ||
        message.includes('customer') ||
        message.includes('não encontrado') ||
        message.includes('not found')
    )
}

export {
    isSystemNotFound,
    notifySystemNotFound,
    resetSystemNotFound,
    subscribeSystemStatus,
    isSystemNotFoundError,
}
