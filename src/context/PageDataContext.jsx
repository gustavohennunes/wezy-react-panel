    import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
    import { useSearchParams, useNavigate } from 'react-router-dom'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { toast } from 'sonner'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { useMenus } from '@/providers/MenusProvider'
    import { findLegacyRedirectDeep, applyLegacyRedirect, isExternalUrl } from '@/utils/legacyRedirect'
    import { lerRespostaApi, lerBlob } from '@/utils/apiResponse'
    import { isSystemNotFoundError, notifySystemNotFound } from '@/utils/systemStatus'

    const PageDataContext = createContext()

    export const PageDataProvider = ({ children }) => {

        const [pageData, setPageData] = useState(null);
        const [loading, setLoading]   = useState(true);
        const [error, setError]       = useState(null);
        const [searchParams]          = useSearchParams();
        const [redirecting, setRedirecting] = useState(false);
        const { logout }              = useAuth();
        const { getMenuConfig }       = useMenus();
        const navigate                = useNavigate();

        const menuConfig = getMenuConfig('primary');

        //SEM DEDUPLICAÇÃO POR URL: O ANTIGO "if (urlApi === lastUrl) return" NUNCA FUNCIONOU (lastUrl FICAVA
        //PRESO NO null DO PRIMEIRO RENDER DENTRO DO useCallback) — E OS REFRESHS APÓS EXCLUIR/ALTERAR
        //DEPENDEM DE PODER CHAMAR A MESMA URL DE NOVO
        const callApi = useCallback(async (urlApi) => {

            setLoading(true);

            try {
                
                //Blob: O CARTÃO PODE DEVOLVER UM ARQUIVO (EXPORTAÇÃO, PDF, XML) EM VEZ DO JSON DA PONTE
                const response = await api.get(urlApi, { responseType: 'blob' });

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

                if (err.status == 401) {
                    logout()
                }

            } finally {
                setLoading(false)
            }

        }, [])

        //O MENU SÓ IMPORTA SEM MÓDULO NA URL (DESTAQUE). COM ?pag=, O MENU CHEGANDO DEPOIS DO LOGIN (OU RECARREGANDO)
        //REPETIA O EFFECT E PEDIA O MESMO panel/module DUAS VEZES
        const menuDestaque = (searchParams.get('pag') || searchParams.get('slug')) ? null : menuConfig

        useEffect(() => {

            const urlApi = buildApiUrl(searchParams)

            //SEM MÓDULO NA URL: O PAINEL-PHP REDIRECIONA A HOME PARA O MÓDULO DESTAQUE
            //(index.php:534). O panel/menus DEVOLVE O DESTAQUE EM highlight (QUANDO O USUÁRIO
            //TEM ACESSO); SEM DESTAQUE, ABRE O PRIMEIRO MÓDULO VISÍVEL DO MENU.
            //LOGIN POR HASH EM ANDAMENTO (JWTProvider): NÃO CARREGA NEM REDIRECIONA, SENÃO A URL PERDE O hash
            if (searchParams.get('hash')) {
                setLoading(true)
                return
            }

            const hasModuleParam = searchParams.get('pag') || searchParams.get('slug')
            if (!hasModuleParam) {

                //MENU AINDA CARREGANDO — MANTÉM O LOADER
                if (!menuDestaque) {
                    setLoading(true)
                    return
                }

                const destaque = menuDestaque?.highlight || menuDestaque?.structure?.highlight
                if (typeof destaque === 'string' && destaque !== '') {
                    navigate('/?pag=' + encodeURIComponent(destaque), { replace: true })
                    return
                }

                const menuMain = menuDestaque?.main || menuDestaque?.structure?.main || []

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

        }, [ searchParams, menuDestaque ])

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
