    import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
    import { useSearchParams, useNavigate } from 'react-router-dom'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { toast } from 'sonner'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { useMenus } from '@/providers/MenusProvider'
    import { findLegacyRedirectDeep, applyLegacyRedirect } from '@/utils/legacyRedirect'

    const PageDataContext = createContext()

    export const PageDataProvider = ({ children }) => {

        const [pageData, setPageData] = useState(null);
        const [loading, setLoading]   = useState(true);
        const [error, setError]       = useState(null);
        const [searchParams]          = useSearchParams();
        const [lastUrl, setLastUrl]   = useState(null);
        const { auth, logout }        = useAuth();
        const { getMenuConfig }       = useMenus();
        const navigate                = useNavigate();

        const menuConfig = getMenuConfig('primary');

        const callApi = useCallback(async (urlApi) => {
            
            if (urlApi === lastUrl) return

            setLoading(true);
            setLastUrl(urlApi);

            try {
                
                const response = await api.get(urlApi);

                //O CARD PODE ENCERRAR COM exit(loc(...)) — NESSE CASO O PHP DESCARREGA O BUFFER E A
                //RESPOSTA VEM COMO HTML CRU (<script>window.location="...")</script>), SEM O JSON.
                //POR ISSO A BUSCA PELO REDIRECT VEM ANTES DE LER A ESTRUTURA success.response.data.
                const redirectLegado = findLegacyRedirectDeep(response.data);
                if (redirectLegado && applyLegacyRedirect(redirectLegado, navigate)) {
                    return;
                }

                const data = response.data?.success?.response?.data;

                if (!data) {

                    toast(`❌ Erro: `, {
                        description: <span style={{ 'color': 'white' }}>Resposta inesperada do servidor para este módulo.</span>,
                        style: {
                            color: 'white',
                            background: 'var(--tw-danger)',
                            fontWeight: 'bold'
                        }
                    })

                    setLoading(false)

                    return

                }

                setPageData(data);

            } catch (err) {

                toast(`❌ Erro: `, {
                    description: <span style = {{ 'color': 'white' }}> { err?.response?.data?.error?.message }</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        fontWeight: 'bold'
                    }
                })
                
                setError(err)

                if (err.status == 401) {
                    logout()
                }

            } finally {
                setLoading(false)
            }

        }, [])

        useEffect(() => {

            const urlApi = buildApiUrl(searchParams)

            //SEM MÓDULO NA URL: O PAINEL-PHP REDIRECIONA A HOME PARA O MÓDULO DESTAQUE
            //(index.php:533). A API panel/menus NÃO expõe o destaque, então abrimos o
            //primeiro módulo visível do menu assim que ele carrega — mesma tela que o
            //usuário via ao entrar no painel antigo.
            const hasModuleParam = searchParams.get('pag') || searchParams.get('slug')
            if (!hasModuleParam) {

                //MENU AINDA CARREGANDO — MANTÉM O LOADER
                if (!menuConfig) {
                    setLoading(true)
                    return
                }

                const menuMain = menuConfig?.main || menuConfig?.structure?.main || []

                const firstItem =
                    menuMain.find((item) => item?.path && item?.title !== 'Dashboards') ||
                    menuMain.flatMap((item) => item?.children || []).find((child) => child?.path)

                if (firstItem?.path) {
                    navigate('/' + firstItem.path, { replace: true })
                    return
                }

                //MENU SEM NENHUM MÓDULO COM PATH — CAI NO DASHBOARD PADRÃO
                setPageData({ layout: 'dashboard' })
                setLoading(false)
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

        }, [ searchParams, menuConfig ])

        return (
            <PageDataContext.Provider value={{ pageData, loading, error, callApi }}>
                {children}
            </PageDataContext.Provider>
        )

    }

    export const usePageData = () => useContext(PageDataContext)
