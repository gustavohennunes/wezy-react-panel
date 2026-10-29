    import { buildApiUrl } from './urlHelper'
    import { getAuthToken } from '@/auth/_helpers'
    import { getCustomerHost } from './customerHost'
    import { getApiUrl } from './apiUrl'

    // PONTE PARA O JAVASCRIPT DOS CARTÕES DO PAINEL LEGADO.
    // NO PAINEL ANTIGO O JS DOS CARTÕES CHAMA index.php?pag=...&layout=false (OU ?pag=...) NO MESMO HOST, COM O
    // COOKIE DE SESSÃO. NO REACT ESSA URL CAI NO PRÓPRIO SPA. AQUI ELA É REESCRITA PARA A ROTA panel/module DA API,
    // COM O TOKEN E O Customer-Host — A API DEVOLVE O QUE O CARTÃO IMPRIMIR QUANDO layout=false.

    // index.php, index.php?..., ?pag=..., /index.php?... OU URL ABSOLUTA DO PRÓPRIO SPA
    const legacySearch = (url) => {

        if (typeof url !== 'string' || url === '') {
            return null
        }

        if (/^https?:\/\//i.test(url)) {

            try {

                const destino = new URL(url)
                if (destino.origin !== window.location.origin) {
                    return null
                }

                if (/\/index\.php$/i.test(destino.pathname)) {
                    return destino.search
                }

                return destino.pathname === '/' && /[?&](pag|slug)=/.test(destino.search) ? destino.search : null

            } catch {
                return null
            }

        }

        const match = /^(?:\.?\/)?(?:index\.php)?(\?.*)?$/i.exec(url.split('#')[0])
        if (!match || (!match[1] && !/index\.php/i.test(url))) {
            return null
        }

        return match[1] || ''

    }

    export const isLegacyUrl = (url) => legacySearch(url) !== null

    // CONVERTE A URL LEGADA EM URL ABSOLUTA DA API. extraQuery: DADOS DE UM GET DO jQuery (JÁ SERIALIZADOS)
    export const legacyUrlToApiUrl = (url, extraQuery = '') => {

        const search = legacySearch(url)
        if (search === null) {
            return null
        }

        const params = new URLSearchParams(search)

        if (extraQuery) {
            new URLSearchParams(extraQuery).forEach((value, key) => params.append(key, value))
        }

        // SEM pag NA CHAMADA, É O MÓDULO DA TELA ATUAL (O LEGADO FAZIA ISSO PELO $_GET DA PÁGINA)
        if (!params.get('pag') && !params.get('slug')) {

            const atual = new URLSearchParams(window.location.search)
            const slugAtual = atual.get('pag') || atual.get('slug')

            if (!slugAtual) {
                return null
            }

            params.set('pag', slugAtual)

        }

        const path = buildApiUrl(params)
        if (!path) {
            return null
        }

        return `${getApiUrl()}${path}`

    }

    export const legacyHeaders = () => {

        const headers = {}

        const token = getAuthToken()
        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        const customerHost = getCustomerHost()
        if (customerHost) {
            headers['Customer-Host'] = customerHost
        }

        return headers

    }

    // FUNÇÃO DO painel.js LEGADO QUE O JS DOS CARTÕES USA (ex.: framework/funil.php)
    const getQueryParams = (qs) => {

        qs = String(qs || '').split('+').join(' ')

        const params = {}
        const re = /[?&]?([^=]+)=([^&]*)/g
        let tokens

        while ((tokens = re.exec(qs))) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
        }

        return params

    }

    let instalado = false

    export const installLegacyBridge = () => {

        if (instalado || typeof window === 'undefined') {
            return
        }

        instalado = true

        if (typeof window.getQueryParams !== 'function') {
            window.getQueryParams = getQueryParams
        }

        // jQuery ($.get, $.post, $.ajax) — O index.html CARREGA O jQuery DO PAINEL LEGADO
        const jq = window.jQuery
        if (jq && typeof jq.ajaxPrefilter === 'function') {

            jq.ajaxPrefilter((options) => {

                const isGet = String(options.type || 'GET').toUpperCase() === 'GET'
                const dadosGet = isGet && typeof options.data === 'string' ? options.data : ''

                const apiUrl = legacyUrlToApiUrl(options.url, dadosGet)
                if (!apiUrl) {
                    return
                }

                options.url = apiUrl

                // OS DADOS DO GET JÁ FORAM PARA A URL (O pag VIROU slug — UM pag NA QUERY QUEBRA A ROTA DA API)
                if (isGet) {
                    options.data = undefined
                }

                // SEM ISSO O jQuery MANDA X-Requested-With, QUE A API NÃO LIBERA NO CORS
                options.crossDomain = true
                options.headers = { ...(options.headers || {}), ...legacyHeaders() }

            })

        }

        // $(campo).val(valor) DO JS DOS CARTÕES EM CAMPO CONTROLADO PELO REACT: O jQuery TROCA SÓ O DOM, O ESTADO DO
        // FORMULÁRIO CONTINUA COM O VALOR ANTIGO E O PRÓXIMO RENDER DESFAZ A TROCA (ex.: O E-MAIL QUE O emails-disparos
        // PREENCHE AO ESCOLHER O DESTINATÁRIO). AQUI A TROCA VIRA UM EVENTO DE DIGITAÇÃO QUE O onChange DO REACT RECEBE
        if (jq && jq.fn && typeof jq.fn.val === 'function' && !jq.fn.val.ponteReact) {

            const valOriginal = jq.fn.val

            const controladoPeloReact = (el) =>
                Object.keys(el).some((chave) => chave.startsWith('__reactProps$') && typeof el[chave]?.onChange === 'function')

            const valComReact = function (...args) {

                if (args.length === 0) {
                    return valOriginal.apply(this, args)
                }

                const anteriores = this.toArray().map((el) => el.value)
                const resultado  = valOriginal.apply(this, args)

                this.each((indice, el) => {

                    const campoDeFormulario = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
                    if (!campoDeFormulario || el.type === 'hidden' || el.value === anteriores[indice] || !controladoPeloReact(el)) return

                    //O REACT SÓ DISPARA onChange SE O VALOR "RASTREADO" FOR DIFERENTE DO DOM: VOLTA O RASTREADO PARA O ANTERIOR
                    el._valueTracker?.setValue(anteriores[indice])
                    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))

                })

                return resultado

            }

            valComReact.ponteReact = true
            jq.fn.val = valComReact

        }

        // XMLHttpRequest DIRETO (SEM jQuery). O jQuery TAMBÉM USA XHR, MAS A URL DELE JÁ CHEGA REESCRITA PELO
        // ajaxPrefilter — AÍ NÃO É MAIS "LEGADA" E PASSA DIRETO POR AQUI
        if (typeof window.XMLHttpRequest === 'function') {

            const openOriginal = window.XMLHttpRequest.prototype.open

            window.XMLHttpRequest.prototype.open = function (method, url, ...resto) {

                const apiUrl = typeof url === 'string' ? legacyUrlToApiUrl(url) : null

                openOriginal.call(this, method, apiUrl || url, ...resto)

                if (apiUrl) {
                    Object.entries(legacyHeaders()).forEach(([key, value]) => this.setRequestHeader(key, value))
                }

            }

        }

        // fetch()
        if (typeof window.fetch === 'function') {

            const fetchOriginal = window.fetch.bind(window)

            window.fetch = (input, init = {}) => {

                const apiUrl = typeof input === 'string' ? legacyUrlToApiUrl(input) : null
                if (!apiUrl) {
                    return fetchOriginal(input, init)
                }

                const headers = new Headers(init.headers || {})
                Object.entries(legacyHeaders()).forEach(([key, value]) => headers.set(key, value))

                return fetchOriginal(apiUrl, { ...init, headers, credentials: 'omit' })

            }

        }

    }
