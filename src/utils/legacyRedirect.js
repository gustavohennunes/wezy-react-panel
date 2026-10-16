    import { cleanUrl } from './urlHelper'

    // O PAINEL ANTIGO REDIRECIONA EMITINDO <script>window.location="..."</script> (função loc() do PHP).
    // O React insere esse HTML via dangerouslySetInnerHTML, e o navegador NÃO executa <script> vindo de
    // innerHTML — então o redirect simplesmente se perdia. Aqui detectamos o padrão e navegamos.
    //
    // Os padrões exigem ATRIBUIÇÃO seguida de string literal, então usos de leitura
    // (ex.: if (window.location.href.includes('x')) ou == ) não disparam falso positivo.
    // (?!\s*\+): STRING QUE É SÓ O COMEÇO DE UMA CONCATENAÇÃO NÃO É REDIRECT — É O HANDLER DE UM SCRIPT DO CARTÃO
    // (ex.: emails-disparos: window.location = '/?pag=...&parametros=' + $(this).val(); NO change DO SELECT). SEM ISSO
    // A TELA COM &parametros=59 "REDIRECIONAVA" PARA &parametros= AO CARREGAR
    const REDIRECT_PATTERNS = [
        /window\.location(?:\.href)?\s*=\s*["']([^"']+)["'](?!\s*\+)/i,
        /window\.location\.(?:replace|assign)\s*\(\s*["']([^"']+)["']\s*\)/i,
        /window\.top\.location(?:\.href)?\s*=\s*["']([^"']+)["'](?!\s*\+)/i,
        /location\.href\s*=\s*["']([^"']+)["'](?!\s*\+)/i,
    ]

    // PROCURA O REDIRECT EM UMA STRING
    export const findLegacyRedirect = (value) => {

        if (typeof value !== 'string' || value.indexOf('location') === -1) {
            return null
        }

        for (const pattern of REDIRECT_PATTERNS) {

            const match = pattern.exec(value)
            if (match && match[1]) {
                return match[1]
            }

        }

        return null

    }

    // VARRE A RESPOSTA INTEIRA (extra-html-content, campos aut, células da listagem, mensagens...)
    export const findLegacyRedirectDeep = (data, depth = 0) => {

        if (!data || depth > 8) {
            return null
        }

        if (typeof data === 'string') {
            return findLegacyRedirect(data)
        }

        if (Array.isArray(data)) {

            for (const item of data) {

                const found = findLegacyRedirectDeep(item, depth + 1)
                if (found) return found

            }

            return null

        }

        if (typeof data === 'object') {

            for (const key of Object.keys(data)) {

                const found = findLegacyRedirectDeep(data[key], depth + 1)
                if (found) return found

            }

        }

        return null

    }

    // URL ABSOLUTA PARA OUTRO HOST (SAI DO SPA)
    export const isExternalUrl = (url) => {

        if (!/^https?:\/\//i.test(url || '')) {
            return false
        }

        try {
            return new URL(url).origin !== window.location.origin
        } catch {
            return false
        }

    }

    // EXECUTA O REDIRECT: link externo sai do SPA; interno usa a navegação do React Router.
    // Devolve true quando navegou (para o chamador interromper o fluxo).
    export const applyLegacyRedirect = (url, navigate = null) => {

        if (!url) {
            return false
        }

        const isAbsolute = /^https?:\/\//i.test(url)

        if (isAbsolute) {

            let destino = null

            try {
                destino = new URL(url)
            } catch {
                return false
            }

            // OUTRO HOST (ex.: acesso ao painel do cliente por hash) — sai do SPA. replace: É UM REDIRECT, A URL DA
            // AÇÃO (ex.: ?pag=clientes&acao=Painel) NÃO FICA NO HISTÓRICO PARA O "VOLTAR" REABRIR
            if (destino.origin !== window.location.origin) {

                window.location.replace(url)

                return true

            }

            // MESMO HOST — evita recarregar na mesma URL (loop)
            if (destino.pathname + destino.search === window.location.pathname + window.location.search) {
                return false
            }

            // ACESSO DE SUPORTE (?hash=, "Acessar Painel" DO PAINEL DE MÓDULOS): CARREGA A PÁGINA DO ZERO. NA NAVEGAÇÃO
            // INTERNA O PageDataContext ABRIA O MÓDULO DESTAQUE ANTES DO LOGIN LER O hash, E ELE SE PERDIA
            if (destino.searchParams.has('hash')) {
                window.location.replace(url)
                return true
            }

            if (navigate) {
                navigate(destino.pathname + destino.search, { replace: true })
            } else {
                window.location.href = url
            }

            return true

        }

        // RELATIVO (ex.: index.php?pag=clientes&erro=x ou ?pag=...)
        const interno = cleanUrl(url)

        if (interno === window.location.search || interno === window.location.pathname + window.location.search) {
            return false
        }

        if (navigate) {
            navigate(interno.startsWith('?') || interno.startsWith('/') ? interno : '/' + interno, { replace: true })
        } else {
            window.location.href = interno
        }

        return true

    }
