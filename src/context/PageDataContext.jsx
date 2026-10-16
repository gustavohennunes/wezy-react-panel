    import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'
    import { useSearchParams, useNavigate } from 'react-router-dom'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { toast } from 'sonner'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { useMenus } from '@/providers/MenusProvider'
    import { findLegacyRedirectDeep, applyLegacyRedirect, isExternalUrl } from '@/utils/legacyRedirect'
    import { lerRespostaApi, lerBlob } from '@/utils/apiResponse'
    import { isSystemNotFoundError, notifySystemNotFound } from '@/utils/systemStatus'
    import { getAuthToken } from '@/auth/_helpers'

    const PageDataContext = createContext()

    export const PageDataProvider = ({ children }) => {

        const [pageData, setPageData] = useState(null);
        const [loading, setLoading]   = useState(true);
        const [error, setError]       = useState(null);
        const [searchParams]          = useSearchParams();
        const [redirecting, setRedirecting] = useState(false);
        const { logout }              = useAuth();
        const navigate                = useNavigate();

        //MODO DE EDIÇÃO DO SITE: A SIDEBAR MOSTRA A ÁRVORE DO PROJETO (panel/menus). O MENU É RECARREGADO AO LIGAR/DESLIGAR
        //O MODO (?pag=ativar-modulo-edicao) E, COM ELE LIGADO, NAS TELAS DO PROJETO — PÁGINA/SECTION/BACK-END NOVOS
        //APARECEM NA ÁRVORE, COMO NO LEGADO (QUE MONTAVA O MENU A CADA CARREGAMENTO)
        const { fetchMenu, getMenuConfig } = useMenus();
        const menusRef = useRef({ fetchMenu, editor: false });
        menusRef.current = { fetchMenu, editor: Boolean(getMenuConfig('primary')?.editor) };

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

                    setLoading(false)

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
                    logout()
                }

            } finally {
                if (!redirecionou) {
                    setLoading(false)
                }
            }

        }, [])

        useEffect(() => {

            const urlApi = buildApiUrl(searchParams)

            //LOGIN POR HASH EM ANDAMENTO (JWTProvider): NÃO CARREGA NEM REDIRECIONA, SENÃO A URL PERDE O hash
            if (searchParams.get('hash')) {
                setLoading(true)
                return
            }

            //SEM MÓDULO NA URL ('/' OU LOGO APÓS O LOGIN): VAI PARA O DASHBOARD. ANTES ABRIA O MÓDULO DESTAQUE DO MENU
            //(COMO O index.php:534 LEGADO), E O DESTAQUE PODIA REDIRECIONAR DE NOVO (ex.: analytics -> &acao=Dashboard)
            const hasModuleParam = searchParams.get('pag') || searchParams.get('slug')
            if (!hasModuleParam) {
                navigate('/?pag=dashboard', { replace: true })
                return
            }

            if (urlApi === false || urlApi === '/panel/module?slug=dashboard') {

                let pageData = {
                    layout: 'dashboard',
                }

                setPageData(pageData)
                setLoading(false)

                return;

            } else if (urlApi === '/panel/module?slug=planos') {

                let pageData = {
                    layout: 'plans',
                }

                setPageData(pageData)
                setLoading(false)

                return;

            }

            callApi(urlApi)

        }, [ searchParams ])

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
