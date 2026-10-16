    import { getCustomerHost } from './customerHost'

    // PÁGINA INICIAL DO PAINEL (AO LOGAR E EM "/" SEM ?pag=). PADRÃO: DASHBOARD. POR CLIENTE, PELO .env
    // VITE_START_PAGES="dominio=destino;dominio=destino" (ex.: wezy.com.br=/?pag=clientes&parametro=filtrar-ativos) —
    // O DOMÍNIO É O Customer-Host (O DO ?a= OU O QUE O LOGIN CENTRAL DEVOLVEU)

    const PADRAO = '/?pag=dashboard'

    const PAGINAS = String(import.meta.env.VITE_START_PAGES || '')
        .split(';')
        .map((entrada) => {
            const igual = entrada.indexOf('=')
            if (igual <= 0) return null
            return [entrada.slice(0, igual).trim().toLowerCase(), entrada.slice(igual + 1).trim()]
        })
        .filter((par) => par && par[0] && par[1])

    export const paginaInicial = () => {
        const host = String(getCustomerHost() || '').toLowerCase()
        const achada = PAGINAS.find(([dominio]) => dominio === host)
        if (!achada) return PADRAO
        const destino = achada[1]
        return destino.startsWith('/') ? destino : '/' + destino
    }
