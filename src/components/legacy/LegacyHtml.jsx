    import { useEffect, useRef } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { toast } from 'sonner'
    import { api } from '@/services/api'
    import { usePageData } from '@/context/PageDataContext'
    import { buildApiUrl, cleanUrl } from '@/utils/urlHelper'
    import { findLegacyRedirectDeep, applyLegacyRedirect } from '@/utils/legacyRedirect'
    import { isLegacyUrl, legacyUrlToApiUrl } from '@/utils/legacyBridge'
    import { executarScript } from './executarScript'

    // HTML MONTADO PELO PAINEL LEGADO (echo DO CARTÃO, framework/charts.php, funil.php, fotos.php, $cabecalhoPagina...).
    // DIFERENTE DO dangerouslySetInnerHTML:
    //  - EXECUTA OS <script> NA ORDEM, ESPERANDO OS EXTERNOS CARREGAREM (ex.: Chart.js ANTES DO new Chart);
    //  - LINKS ?pag=... NAVEGAM PELO ROUTER EM VEZ DE RECARREGAR A PÁGINA;
    //  - FORMULÁRIOS POST (FILTROS, UPLOAD DE FOTOS) SÃO ENVIADOS PARA A API, COMO O NAVEGADOR FAZIA NO index.php.
    // O HTML VEM DO CÓDIGO DOS CARTÕES DO PRÓPRIO PAINEL (MESMA CONFIANÇA DO index.php LEGADO, QUE O IMPRIMIA DIRETO).

    const mensagemErro = (texto) => {
        toast(`❌ Erro: `, {
            description: <span style={{ color: 'white' }}>{texto}</span>,
            style: {
                color: 'white',
                background: 'var(--tw-danger)',
                border: 'none',
                fontWeight: 'bold'
            }
        })
    }

    const destinoInterno = (url) => {
        const interno = cleanUrl(url)
        return interno.startsWith('?') || interno.startsWith('/') ? interno : '/' + interno
    }

    //VER filaScripts NO useEffect ABAIXO
    let filaScripts = Promise.resolve()

    const LegacyHtml = ({ html, className = '', style }) => {

        const ref          = useRef(null)
        const navigate     = useNavigate()
        const { callApi }  = usePageData()

        // MONTA O HTML E EXECUTA OS SCRIPTS
        useEffect(() => {

            const container = ref.current
            if (!container) {
                return
            }

            container.innerHTML = html || ''

            let cancelado = false

            const scripts = Array.from(container.querySelectorAll('script'))

            const executar = async () => {
                for (const script of scripts) {
                    if (cancelado) return
                    await executarScript(script)
                }
            }

            //FILA ÚNICA ENTRE TODOS OS LegacyHtml DA TELA: NO LEGADO É UM DOCUMENTO SÓ E OS SCRIPTS RODAM NA ORDEM.
            //AQUI O echo DO CARTÃO (output-html, COM O <script src> DO Chart.js) E CADA CAMPO `aut` (COM O new Chart)
            //SÃO INSTÂNCIAS SEPARADAS — SEM A FILA, O new Chart RODAVA ANTES DE O Chart.js CARREGAR
            filaScripts = filaScripts.then(executar, executar)

            return () => {
                cancelado = true
            }

        }, [html])

        // LINKS E FORMULÁRIOS DO HTML LEGADO
        useEffect(() => {

            const container = ref.current
            if (!container) {
                return
            }

            const aoClicar = (event) => {

                if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                    return
                }

                const link = event.target.closest?.('a')
                if (!link || !container.contains(link)) {
                    return
                }

                const href = link.getAttribute('href') || ''
                if (href === '' || href.startsWith('#') || /^javascript:/i.test(href) || (link.target && link.target !== '_self')) {
                    return
                }

                if (!isLegacyUrl(href)) {
                    return
                }

                event.preventDefault()
                navigate(destinoInterno(href))

            }

            const aoEnviar = async (event) => {

                const form = event.target
                if (!(form instanceof HTMLFormElement) || !container.contains(form)) {
                    return
                }

                // .custom-form JÁ É TRATADO NO Main.jsx; target EXTERNO SEGUE O FLUXO NORMAL DO NAVEGADOR
                if (form.classList.contains('custom-form') || (form.target && form.target !== '_self')) {
                    return
                }

                const action = form.getAttribute('action') || ''
                if (action !== '' && !isLegacyUrl(action)) {
                    return
                }

                event.preventDefault()

                const metodo = (form.getAttribute('method') || 'get').toLowerCase()

                let dados
                try {
                    dados = new FormData(form, event.submitter || undefined)
                } catch {
                    dados = new FormData(form)
                    if (event.submitter?.name) {
                        dados.append(event.submitter.name, event.submitter.value ?? '')
                    }
                }

                // GET: O NAVEGADOR TROCA A QUERY DA URL PELOS CAMPOS DO FORMULÁRIO
                if (metodo === 'get') {

                    const params = new URLSearchParams()
                    dados.forEach((value, key) => {
                        if (typeof value === 'string') params.append(key, value)
                    })

                    if (!params.get('pag') && !params.get('slug')) {
                        const atual = new URLSearchParams(window.location.search)
                        const slugAtual = atual.get('pag') || atual.get('slug')
                        if (slugAtual) params.set('pag', slugAtual)
                    }

                    navigate('/?' + params.toString())

                    return

                }

                // POST: VAI PARA A API NA URL DO action (OU NA URL ATUAL, COMO O NAVEGADOR)
                const apiUrl = legacyUrlToApiUrl(action || window.location.search || '?')
                if (!apiUrl) {
                    return
                }

                try {

                    const response = await api.post(apiUrl, dados, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    })

                    const redirect = findLegacyRedirectDeep(response?.data)
                    if (redirect && applyLegacyRedirect(redirect, navigate)) {
                        return
                    }

                    const resposta = response?.data?.success?.response?.data
                    const redirectPonte = resposta?.redirect || resposta?.params?.redirect
                    if (redirectPonte && applyLegacyRedirect(redirectPonte, navigate)) {
                        return
                    }

                    // SEM REDIRECT: RECARREGA A TELA ATUAL (O CARTÃO PODE TER GUARDADO FILTROS NA SESSÃO)
                    const urlAtual = buildApiUrl(window.location.search)
                    if (urlAtual) {
                        callApi(urlAtual)
                    }

                } catch (error) {

                    mensagemErro(error?.response?.data?.error?.message || error?.message || 'Não foi possível enviar o formulário.')

                }

            }

            container.addEventListener('click', aoClicar)
            container.addEventListener('submit', aoEnviar)

            return () => {
                container.removeEventListener('click', aoClicar)
                container.removeEventListener('submit', aoEnviar)
            }

        }, [navigate, callApi])

        //legacy-html: MARCA USADA PELO legacy-runtime.js (SERVIDO PELA API) PARA DATAS, FOTOS E EXCLUSÃO DO LEGADO
        return <div ref={ref} className={`legacy-html ${className}`.trim()} style={style} />

    }

    export { LegacyHtml }
