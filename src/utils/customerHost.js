import { getData, setData } from './LocalStorage'
import { notifySystemNotFound } from './systemStatus'

const CUSTOMER_HOST_STORAGE_KEY = 'customer-host'

// DOMÍNIO ESCOLHIDO PELA URL (?a=). COMO O $_SESSION['usandoDominio'] DO LEGADO (controles/primario.php): O LOGIN
// PASSA A SER DIRETO NO PAINEL DESSE CLIENTE (panel/login) E NÃO NO CADASTRO CENTRAL (/auth/master). FICA SALVO À
// PARTE PORQUE O customer-host TAMBÉM É GRAVADO PELO LOGIN CENTRAL. OS DOIS SÃO APAGADOS NO LOGOUT
const FIXED_CUSTOMER_HOST_STORAGE_KEY = 'customer-host-fixo'

// ENDEREÇOS DA PLATAFORMA (LOGIN CENTRAL). QUALQUER OUTRO É O PAINEL DE UM CLIENTE (ex.: painel.dudaimoveis.com.br
// APONTANDO PARA O app.wezy.com.br): O CLIENTE SAI DO PRÓPRIO ENDEREÇO E O LOGIN É DIRETO NO BANCO DELE, COMO O
// controles/primario.php FAZ COM O X-Forwarded-Host. LISTA NO .env (VITE_PLATFORM_HOSTS, SEPARADA POR VÍRGULA)
const PLATFORM_HOSTS = String(
    import.meta.env.VITE_PLATFORM_HOSTS ||
        'app.wezy.com.br,painel.wezy.com.br,localhost,127.0.0.1'
)
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)

/** Host do cliente pelo endereço da página (sem o "painel."), ou null num endereço da plataforma. */
const hostDoEndereco = () => {
    const hostname = String(window.location.hostname || '').toLowerCase()
    if (hostname === '' || PLATFORM_HOSTS.includes(hostname)) return null
    return hostname.replace(/^painel\./, '').replace(/^www\./, '') || null
}

/**
 * Resolve o Customer-Host que deve ser enviado nas requisições.
 *
 * Regras (em ordem de prioridade):
 * 1. Se a URL tiver ?a=<host>, esse valor é salvo e passa a ser usado.
 *    Ex.: painel.manentti.com.br/?a=carbonebrasil.com  ->  carbonebrasil.com
 * 2. Endereço de cliente (fora de VITE_PLATFORM_HOSTS): o próprio domínio, sem "painel.".
 *    Ex.: painel.dudaimoveis.com.br  ->  dudaimoveis.com.br
 * 3. Caso já exista um valor salvo anteriormente (login ou ?a=), ele é reutilizado.
 * 4. Endereço da plataforma sem nada salvo: o domínio (sem "painel.", se tiver).
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
            setData(FIXED_CUSTOMER_HOST_STORAGE_KEY, override)
            return override
        }

        // 2. Endereço do próprio cliente
        const doEndereco = hostDoEndereco()
        if (doEndereco) {
            return doEndereco
        }

        // 3. Override salvo anteriormente (login ou ?a=)
        const saved =
            getData(CUSTOMER_HOST_STORAGE_KEY) ||
            getData(FIXED_CUSTOMER_HOST_STORAGE_KEY)
        if (saved) {
            return saved
        }

        // 4. Domínio com prefixo "painel." -> usa o restante
        const hostname = window.location.hostname

        if (hostname.startsWith('painel.')) {
            const rest = hostname.replace(/^painel\./, '')
            if (rest) return rest
        } else if (hostname) {
            // Domínio completo
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

/**
 * Domínio fixado pela URL (?a=) ou pelo endereço do cliente (painel.cliente.com.br), ou null.
 * Com ele o login é feito direto no painel desse cliente, como no painel legado.
 */
const getFixedCustomerHost = () => {
    try {
        const override = new URLSearchParams(window.location.search).get('a')
        if (override) {
            setData(FIXED_CUSTOMER_HOST_STORAGE_KEY, override)
            return override
        }
        return (
            hostDoEndereco() || getData(FIXED_CUSTOMER_HOST_STORAGE_KEY) || null
        )
    } catch (error) {
        console.error('CUSTOMER HOST FIXED RESOLVE ERROR', error)
        return null
    }
}

/**
 * Logout: esquece o cliente salvo, tanto o do login quanto o do ?a=. O próximo login volta a ser o central — a não
 * ser que a URL ainda tenha ?a= ou que o endereço seja o do próprio cliente (painel.cliente.com.br).
 */
const clearCustomerHost = () => {
    try {
        localStorage.removeItem(CUSTOMER_HOST_STORAGE_KEY)
        localStorage.removeItem(FIXED_CUSTOMER_HOST_STORAGE_KEY)
    } catch (error) {
        console.error('CUSTOMER HOST CLEAR ERROR', error)
    }
}

/**
 * Tela de login SEM ?a= na URL (ex.: entrou por /?a=dominio, não logou e depois abriu /auth/login ou /): o cliente
 * salvo pelo ?a= não vale mais e o login volta a ser o central. Com ?a= na URL (login na própria tela do ?a=) mantém.
 */
const clearCustomerHostWithoutParam = () => {
    if (new URLSearchParams(window.location.search).get('a')) return
    clearCustomerHost()
}

/**
 * Caminho de tela de autenticação com o ?a= do cliente fixo (quando houver). Os links entre login, cadastro e
 * recuperação de senha precisam levar o cliente junto: a tela de login sem ?a= volta para o login central e apaga o
 * cliente salvo (clearCustomerHostWithoutParam).
 */
const comCliente = (caminho) => {
    const cliente = getFixedCustomerHost()
    if (!cliente) return caminho
    const [rota, query = ''] = String(caminho).split('?')
    const params = new URLSearchParams(query)
    params.set('a', cliente)
    return rota + '?' + params.toString()
}

/** Volta para o login: o do cliente (/?a=cliente, a tela de login na própria URL) ou o central (/auth/login). */
const loginDoCliente = () => {
    const cliente = getFixedCustomerHost()
    return cliente ? '/?a=' + encodeURIComponent(cliente) : '/auth/login'
}

export {
    comCliente,
    loginDoCliente,
    clearCustomerHostWithoutParam,
    getCustomerHost,
    setCustomerHost,
    clearCustomerHost,
    getFixedCustomerHost,
    CUSTOMER_HOST_STORAGE_KEY,
    FIXED_CUSTOMER_HOST_STORAGE_KEY,
}
