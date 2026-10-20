    import { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback, useMemo, useRef } from 'react'
    import { useSearchParams, useNavigate } from 'react-router-dom'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { toast } from 'sonner'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { useMenus } from '@/providers/MenusProvider'
    import { findLegacyRedirectDeep, applyLegacyRedirect, isExternalUrl } from '@/utils/legacyRedirect'
    import { lerRespostaApi, lerBlob } from '@/utils/apiResponse'
    import { isSystemNotFoundError, notifySystemNotFound } from '@/utils/systemStatus'
    import { paginaInicial } from '@/utils/startPage'
    import { getAuthToken } from '@/auth/_helpers'
    import { avisoErro } from '@/utils/avisos'

    const PageDataContext = createContext()

    export const PageDataProvider = ({ children }) => {

        const [pageData, setPageData] = useState(null);
        const [loading, setLoading]   = useState(true);
        const [error, setError]       = useState(null);
        const [searchParams]          = useSearchParams();
        const [redirecting, setRedirecting] = useState(false);
        const { logout }              = useAuth();
        const navigateAtual           = useNavigate();

        //callApi E O EFFECT DA URL FICAM FIXOS (UMA CHAMADA POR MUDANÇA DE URL); navigate/logout ATUAIS ENTRAM PELA REF
        const rotasRef = useRef({ navigate: navigateAtual, logout });
        useLayoutEffect(() => {
            rotasRef.current = { navigate: navigateAtual, logout };
        }, [navigateAtual, logout]);
        const navigate = useCallback((...args) => rotasRef.current.navigate(...args), []);

        //MODO DE EDIÇÃO DO SITE: A SIDEBAR MOSTRA A ÁRVORE DO PROJETO (panel/menus). O MENU É RECARREGADO AO LIGAR/DESLIGAR
        //O MODO (?pag=ativar-modulo-edicao) E, COM ELE LIGADO, NAS TELAS DO PROJETO — PÁGINA/SECTION/BACK-END NOVOS
        //APARECEM NA ÁRVORE, COMO NO LEGADO (QUE MONTAVA O MENU A CADA CARREGAMENTO)
        const { fetchMenu, getMenuConfig } = useMenus();
        const menusRef = useRef({ fetchMenu, editor: false });
        const menuEditor = Boolean(getMenuConfig('primary')?.editor);
        useLayoutEffect(() => {
            menusRef.current = { fetchMenu, editor: menuEditor };
        }, [fetchMenu, menuEditor]);

        //SEM DEDUPLICAÇÃO POR URL: O ANTIGO "if (urlApi === lastUrl) return" NUNCA FUNCIONOU (lastUrl FICAVA
        //PRESO NO null DO PRIMEIRO RENDER DENTRO DO useCallback) — E OS REFRESHS APÓS EXCLUIR/ALTERAR
        //DEPENDEM DE PODER CHAMAR A MESMA URL DE NOVO
        const callApi = useCallback(async (urlApi) => {

            setLoading(true);

            //REDIRECT DO CARTÃO (ex.: ?pag=analytics -> &acao=Dashboard): O LOADER CONTINUA ATÉ A PRÓXIMA URL CARREGAR.
            //SEM ISSO O finally TIRAVA O LOADER, A TELA ANTERIOR APARECIA POR UM INSTANTE E O LOADER VOLTAVA
            let redirecionou = false;

            //401 DE UM TOKEN QUE JÁ FOI TROCADO (OUTRO LOGIN/PAINEL NO MEIO) NÃO DESLOGA — VER fetchMenu
            const tokenUsado = getAuthToken();

            try {
                
                //Blob: O CARTÃO PODE DEVOLVER UM ARQUIVO (EXPORTAÇÃO, PDF, XML) EM VEZ DO JSON DA PONTE
                const response = await api.get(urlApi, { responseType: 'blob' });

                if (/[?&]slug=ativar-modulo-edicao(&|$)/.test(urlApi) || (menusRef.current.editor && /[?&]slug=projetos-paginas/.test(urlApi))) {
                    menusRef.current.fetchMenu();
                }

                const corpo = await lerRespostaApi(response);
                if (corpo === null) {

                    //ARQUIVO BAIXADO: VOLTA PARA A TELA DE ONDE O LINK FOI CLICADO, COMO O NAVEGADOR FAZIA NO LEGADO
                    if (window.history.length > 1) {
                        navigate(-1);
                    }

                    return;

                }

                response.data = corpo;

                //O CARD PODE ENCERRAR COM exit(loc(...)) — NESSE CASO O PHP DESCARREGA O BUFFER E A
                //RESPOSTA VEM COMO HTML CRU (<script>window.location="...")</script>), SEM O JSON.
                //POR ISSO A BUSCA PELO REDIRECT VEM ANTES DE LER A ESTRUTURA success.response.data.
                const redirectLegado = findLegacyRedirectDeep(response.data);
                if (redirectLegado && applyLegacyRedirect(redirectLegado, navigate)) {

                    redirecionou = true;

                    //SAINDO DO SPA (OUTRO HOST, ex.: acao=Painel) — O NAVEGADOR AINDA LEVA UM TEMPO PARA
                    //TROCAR DE PÁGINA, ENTÃO O LAYOUT CONTINUA ESCONDIDO ATRÁS DO LOADER ATÉ LÁ
                    if (isExternalUrl(redirectLegado)) {
                        setRedirecting(true);
                    }

                    return;
                }

                const data = response.data?.success?.response?.data;

                if (!data) {

                    toast(`❌ Erro: `, {
                        description: <span style={{ 'color': 'white' }}>Resposta inesperada do servidor para este módulo.</span>,
                        style: {
                            color: 'white',
                            background: 'var(--tw-danger)',
                            border: 'none',
                            fontWeight: 'bold'
                        }
                    })

                    return

                }

                setPageData(data);

            } catch (err) {

                //COM responseType blob O CORPO DO ERRO TAMBÉM VEM COMO Blob
                if (err?.response?.data instanceof Blob) {
                    err.response.data = await lerBlob(err.response.data);
                    if (isSystemNotFoundError(err)) {
                        notifySystemNotFound();
                    }
                }

                toast(`❌ Erro: `, {
                    description: <span style = {{ 'color': 'white' }}> { err?.response?.data?.error?.message }</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        border: 'none',
                        fontWeight: 'bold'
                    }
                })
                
                setError(err)

                if (err.status == 401 && getAuthToken() === tokenUsado) {
                    rotasRef.current.logout()
                }

            } finally {
                //REDIRECIONOU: O LOADER CONTINUA (true) ATÉ A PRÓXIMA URL CARREGAR
                setLoading(redirecionou)
            }

        }, [navigate])

        //TELA ANTERIOR (QUERY STRING) PARA O ?pag=ativar-modulo-edicao VOLTAR A ELA (ex.: A SECTION ABERTA) EM VEZ DE CAIR NA
        //LISTA DE PÁGINAS. NO PAINEL ANTIGO O CARTÃO USA O REFERER; AQUI A URL JÁ MUDOU QUANDO A API É CHAMADA, ENTÃO VAI EM &voltar=
        const buscaAnteriorRef = useRef('')

        useEffect(() => {

            let urlApi = buildApiUrl(searchParams)

            const buscaAnterior = buscaAnteriorRef.current
            buscaAnteriorRef.current = searchParams.toString()
            if (urlApi && searchParams.get('pag') === 'ativar-modulo-edicao' && !searchParams.get('voltar') && buscaAnterior) {
                urlApi += '&voltar=' + encodeURIComponent('?' + buscaAnterior)
            }

            //LOGIN POR HASH EM ANDAMENTO (JWTProvider): NÃO CARREGA NEM REDIRECIONA, SENÃO A URL PERDE O hash
            if (searchParams.get('hash')) {
                setLoading(true)
                return
            }

            //&erro=permissao: OS CARTÕES LEGADOS MANDAM PARA CÁ QUEM NÃO TEM ACESSO (ex.: loc('?pag=clientes&erro=permissao')).
            //AVISA E TIRA O PARÂMETRO DA URL — COM ELE O ?pag=dashboard NÃO CAÍA NO DASHBOARD DO REACT E MOSTRAVA
            //"Este módulo não devolveu campos para exibir"
            if (searchParams.get('erro') === 'permissao') {
                avisoErro('Você não tem acesso a esta página.')
                const semErro = new URLSearchParams(searchParams)
                semErro.delete('erro')
                navigate({ search: semErro.toString() ? '?' + semErro.toString() : '' }, { replace: true })
                return
            }

            //SEM MÓDULO NA URL ('/' OU LOGO APÓS O LOGIN): VAI PARA A PÁGINA INICIAL DO CLIENTE (DASHBOARD OU A DO .env
            //VITE_START_PAGES — VER utils/startPage). ANTES ABRIA O MÓDULO DESTAQUE DO MENU (COMO O index.php:534 LEGADO),
            //E O DESTAQUE PODIA REDIRECIONAR DE NOVO (ex.: analytics -> &acao=Dashboard)
            const hasModuleParam = searchParams.get('pag') || searchParams.get('slug')
            if (!hasModuleParam) {
                navigate(paginaInicial(), { replace: true })
                return
            }

            if (urlApi === false || urlApi === '/panel/module?slug=dashboard') {

                let pageData = {
                    layout: 'dashboard',
                }

                setPageData(pageData)
                setLoading(false)

                return;

            }

            callApi(urlApi)

        }, [ searchParams, navigate, callApi ])

        const value = useMemo(
            () => ({ pageData, loading, error, callApi, redirecting }),
            [pageData, loading, error, callApi, redirecting]
        )

        return (
            <PageDataContext.Provider value={value}>
                {children}
            </PageDataContext.Provider>
        )

    }

    export const usePageData = () => useContext(PageDataContext)
