import { getData, setData } from './LocalStorage'
import { notifySystemNotFound } from './systemStatus'

const CUSTOMER_HOST_STORAGE_KEY = 'customer-host'

/**
 * Resolve o Customer-Host que deve ser enviado nas requisições.
 *
 * Regras (em ordem de prioridade):
 * 1. Se a URL tiver ?a=<host>, esse valor é salvo e passa a ser usado.
 *    Ex.: painel.manentti.com.br/?a=carbonebrasil.com  ->  carbonebrasil.com
 * 2. Caso já exista um valor salvo anteriormente (via ?a=), ele é reutilizado.
 * 3. Caso o domínio comece com "painel.", usa o restante do domínio.
 *    Ex.: painel.manentti.com.br  ->  manentti.com.br
 * 4. Caso contrário, usa o domínio completo.
 *    Ex.: mdj.qualquerdominio.com.br  ->  mdj.qualquerdominio.com.br
 *
 * Se nenhum caso resolver um host válido (ex.: domínio vazio), retorna null e
 * dispara o sinal de "sistema não encontrado", bloqueando o app.
 */
const getCustomerHost = () => {
    try {
        const params = new URLSearchParams(window.location.search)
        const override = params.get('a')

        // 1. Override explícito via ?a= (salva para as próximas navegações)
        if (override) {
            setData(CUSTOMER_HOST_STORAGE_KEY, override)
            return override
        }

        // 2. Override salvo anteriormente
        const saved = getData(CUSTOMER_HOST_STORAGE_KEY)
        if (saved) {
            return saved
        }

        // 3. Domínio com prefixo "painel." -> usa o restante
        const hostname = window.location.hostname

        if (hostname.startsWith('painel.')) {
            const rest = hostname.replace(/^painel\./, '')
            if (rest) return rest
        } else if (hostname) {
            // 4. Domínio completo
            return hostname
        }

        // Nenhum caso resolveu um host válido
        notifySystemNotFound()
        return null
    } catch (error) {
        console.error('CUSTOMER HOST RESOLVE ERROR', error)
        notifySystemNotFound()
        return null
    }
}

/**
 * Define o Customer-Host salvo — usado após o login centralizado, que retorna
 * o `dominio` do painel do cliente ao qual o usuário pertence.
 */
const setCustomerHost = (host) => {
    if (!host) return
    try {
        setData(CUSTOMER_HOST_STORAGE_KEY, host)
    } catch (error) {
        console.error('CUSTOMER HOST SET ERROR', error)
    }
}

/** Remove o override salvo (útil no logout). */
const clearCustomerHost = () => {
    try {
        localStorage.removeItem(CUSTOMER_HOST_STORAGE_KEY)
    } catch (error) {
        console.error('CUSTOMER HOST CLEAR ERROR', error)
    }
}

export {
    getCustomerHost,
    setCustomerHost,
    clearCustomerHost,
    CUSTOMER_HOST_STORAGE_KEY,
}
