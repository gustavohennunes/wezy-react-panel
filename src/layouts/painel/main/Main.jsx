
    import { Fragment, useEffect, useMemo, useRef } from 'react'
    import { Helmet } from 'react-helmet-async'
    import { Outlet, useLocation } from 'react-router'
    import { Footer, Header, Sidebar, Toolbar, ToolbarHeading } from '../'
    import { useMenus } from '@/providers'
    import { useResponsive } from '@/hooks'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { comChaves } from '@/utils/chavesUnicas'
    import { SCRIPT_DAS_MASCARAS } from '@/utils/mascarasDoLegado'
    import { resolveModuleTitle, resolveModuleBreadcrumbs } from '@/utils/moduleHeading'
    import { api } from '@/services/api'
    import { usePageData } from '@/context/PageDataContext'
    import { Alert } from '@/components/alert'
    import { avisoErro } from '@/utils/avisos'
    import { LegacyHtml } from '@/components/legacy/LegacyHtml'
    import { installLegacyBridge } from '@/utils/legacyBridge'
    import { Tabs } from '@/components/custom/tabs/tabs'
    import { abasDaListagemNoTopo } from '@/utils/listTabs'
    import { useRestauraRolagem } from './useRestauraRolagem'
    import { utf8ParaBase64 } from '@/utils/base64'
    import { FiltrosCabecalho } from '@/components/list/FiltrosCabecalho'

    //MENSAGENS QUE O CARTÃO DEFINE ($setMsgAlerta, $setMsgFormErro...) OU QUE A PONTE GERA (alterado=ok, inserido=erro...).
    //A PONTE AS ENVIA EM params.messages.{general|list|form}.{success|error|alert}
    const VARIANTE_MENSAGEM = { success: 'success', error: 'danger', alert: 'warning' }

    const mensagensDaPagina = (messages) => {

        const lista = []

        if (!messages || typeof messages !== 'object') {
            return lista
        }

        ;['general', 'list', 'form'].forEach((grupo) => {

            const itens = messages[grupo]
            if (!itens || typeof itens !== 'object') return

            Object.entries(itens).forEach(([tipo, texto]) => {
                if (typeof texto === 'string' && texto.trim() !== '' && VARIANTE_MENSAGEM[tipo]) {
                    lista.push({ variant: VARIANTE_MENSAGEM[tipo], html: texto })
                }
            })

        })

        return lista

    }

    const TITULO_DO_SITE = 'Cayman Sistemas'
    const FAVICON        = 'https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/90426c66d0ad4e8318e8a9fba07dd9cb/favicon.png'

    //CABEÇALHO DA TELA (TÍTULO, MIGALHAS, AVISO, HTML EXTRA DO CARTÃO, CSS/JS DA PÁGINA) DERIVADO DO pageData.
    //A PONTE NÃO RESOLVE O NOME DOS SUBMÓDULOS (VER utils/moduleHeading.js), ENTÃO TÍTULO E MIGALHAS SÃO COMPLETADOS
    //PELA ÁRVORE DO panel/menus
    const cabecalhoDaPagina = (pageData, menuConfig, slug, action) => {

        const params    = pageData?.params
        const extra     = params?.extra_content
        const slugAtual = slug || new URLSearchParams(window.location.search).get('pag') || ''
        const acaoAtual = new URLSearchParams(window.location.search).get('acao') || ''

        const titulo = resolveModuleTitle(params?.title, menuConfig, slugAtual)

        return {
            titulo,
            tituloDaAba: titulo ? `${titulo} - ${TITULO_DO_SITE}` : TITULO_DO_SITE,
            breadcrumbs: resolveModuleBreadcrumbs(params?.breadcrumbs, menuConfig, slugAtual, acaoAtual)
                .replaceAll('index.php', '')
                //"Início" VEM COMO href="index.php" (OU VAZIO): SEM O index.php FICAVA href="" E RECARREGAVA A PRÓPRIA PÁGINA
                .replace(/(<a\b[^>]*\bhref=)(["'])\s*\2/gi, '$1$2/$2')
                .replaceAll('class="', 'class="text-[13px] ')
                .replaceAll(' > ', '<i class="ki-filled ki-right text-gray-500 !text-[11px] mx-1"></i>'),
            aviso: params?.message || (action == 'finalizar-cadastro' ? 'Você está quase lá! Complete seu cadastro!' : ''),
            antesDoCabecalho: extra?.header?.before || '',
            //$cabecalhoPagina DO CARTÃO (HTML ANTES DA LISTAGEM — MUITAS VEZES OS FILTROS)
            depoisDoCabecalho: extra?.header?.after || '',
            rodape: extra?.footer || '',
            //CSS VAI COMO data: URI EM BASE64 (UTF-8 SEGURO): btoa() QUEBRA COM QUALQUER CARACTERE FORA DO latin1 (ç, é, emoji...).
            //O JS DO MÓDULO RODA NO PanelContent (ScriptDoModulo), NA FILA DOS SCRIPTS DO CARTÃO
            css: pageData?.css ? utf8ParaBase64(pageData.css) : '',
        }

    }

    //FORMULÁRIO .custom-form DO HTML DOS CARTÕES (FILTROS ANTIGOS): ENVIA PELA API E SEGUE O redirect DA RESPOSTA
    const enviarFormularioDoCartao = async (event) => {

        if (!(event.target instanceof HTMLFormElement) || !event.target.classList.contains('custom-form')) return

        event.preventDefault()

        try {

            const response = await api.post(buildApiUrl(window.location.search), new FormData(event.target), {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            const redirect = response?.data?.success?.response?.data?.params?.redirect
            if (redirect) {
                window.location.href = redirect
                return
            }

        } catch {
            //CAI NO AVISO ABAIXO
        }

        avisoErro('Não foi possível realizar filtro!')

    }

    const Main = () => {

        const mobileMode        = useResponsive('down', 'lg');
        const { search }        = useLocation();
        const { getMenuConfig } = useMenus();
        const menuConfig        = getMenuConfig('primary');
        const { pageData, loading } = usePageData();
        //slug/action SAEM DA URL ATUAL DO ROUTER (ANTES VINHAM DO AuthProvider, QUE FICA FORA DO
        //ROUTER E MANTINHA O VALOR ANTIGO DEPOIS DE UMA NAVEGAÇÃO SEM RELOAD)
        const urlParams         = new URLSearchParams(search);
        const slug              = urlParams.get('slug') ?? urlParams.get('pag') ?? '';
        const action            = urlParams.get('action') ?? '';
        //<div> QUE ROLA O CONTEÚDO NO DESKTOP: A POSIÇÃO VOLTA APÓS F5 / ABA RECARREGADA (VER useRestauraRolagem)
        const rolagemRef        = useRef(null);

        useRestauraRolagem(rolagemRef, loading, pageData);

        //menuConfig ENTRA NA LISTA PORQUE O MENU PODE CHEGAR DEPOIS DO MÓDULO
        const cabecalho = useMemo(() => cabecalhoDaPagina(pageData, menuConfig, slug, action), [pageData, menuConfig, slug, action]);

        //DIRECIONA A PÁGINA
        useEffect(() => {
            if (pageData?.params?.redirect) {
                window.location.href = pageData.params.redirect;
            }
        }, [pageData]);

        //JS DOS CARTÕES CHAMA index.php?...&layout=false — REESCRITO PARA A API (VER utils/legacyBridge.js)
        useEffect(() => {
            installLegacyBridge();
        }, []);

        //UM LISTENER SÓ, NO document: PEGA TAMBÉM O .custom-form QUE O SCRIPT DO CARTÃO CRIA DEPOIS (ANTES ERA RELIGADO EM
        //CADA FORMULÁRIO A CADA RENDER)
        useEffect(() => {
            document.addEventListener('submit', enviarFormularioDoCartao);
            return () => document.removeEventListener('submit', enviarFormularioDoCartao);
        }, []);

        const mensagens = mensagensDaPagina(pageData?.params?.messages);
        const { titulo: title, breadcrumbs, aviso: pageMessage, antesDoCabecalho: headerContent, depoisDoCabecalho: headerAfterContent, rodape: footerContent, css: pageCss } = cabecalho;

        return (
            <Fragment>

                <Helmet>

                    <title>{cabecalho.tituloDaAba}</title>

                    <link rel="icon" type="image/png" href={FAVICON} />
                    <meta name="title" content={cabecalho.tituloDaAba} />

                    {/* MÁSCARAS DO LEGADO (Mascara, Telefone, Cpf...) QUE O HTML DOS CARTÕES CHAMA NO onkeypress — VER utils/mascarasDoLegado */}

                    <script async src={SCRIPT_DAS_MASCARAS} />

                    {pageCss && (
                        <link rel="stylesheet" href={"data:text/css;charset=utf-8;base64," + pageCss} />
                    )}

                </Helmet>

                <div className="flex grow">

                    <Sidebar />

                    {mobileMode && <Header />}

                    <div className="flex flex-col lg:flex-row grow pt-[--tw-header-height] lg:pt-0">

                        <div className="flex flex-col grow items-stretch rounded-xl bg-[--tw-content-bg] dark:bg-[--tw-content-bg-dark] border border-gray-300 dark:border-gray-200 lg:ms-[--tw-sidebar-width] mt-0 lg:mt-[15px] m-[15px]">

                            <div ref={rolagemRef} className="flex flex-col grow lg:scrollable-y-auto lg:[scrollbar-width:auto] lg:light:[--tw-scrollbar-thumb-color:var(--tw-content-scrollbar-color)] pt-5">

                                <main className="grow">

                                    <Toolbar>

                                        {title && <ToolbarHeading title={title} />}

                                        {breadcrumbs && (
                                            //HOVER SÓ NOS ITENS NAVEGÁVEIS — O ÚLTIMO (PÁGINA ATUAL) VEM COM href="javascript:void(0);"
                                            <div
                                                className="breadcrumbs mt-0.5 [&_a]:transition-colors [&_a:not([href^='javascript']):hover]:text-primary [&_a:not([href^='javascript']):hover]:underline [&_a:not([href^='javascript']):hover]:underline-offset-2 [&_a[href^='javascript']]:cursor-default"
                                                dangerouslySetInnerHTML={{ __html: breadcrumbs }}
                                            />
                                        )}

                                        {pageMessage && (
                                            <Alert variant="warning" className="mt-4 w-full">
                                                {pageMessage}
                                            </Alert>
                                        )}

                                        {comChaves(mensagens, (mensagem) => `${mensagem.variant}|${mensagem.html}`).map(({ item: mensagem, chave }) => (
                                            <Alert key={chave} variant={mensagem.variant} className="mt-4 w-full">
                                                {/* LINK DENTRO DA MENSAGEM DO CARTÃO (ex.: "clique aqui" DO projetos-css-padrao) SAÍA COMO TEXTO COMUM */}
                                                <span
                                                    className="[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80"
                                                    dangerouslySetInnerHTML={{ __html: mensagem.html }}
                                                />
                                            </Alert>
                                        ))}

                                        {headerContent && (
                                            <LegacyHtml html={headerContent} className="w-full" />
                                        )}

                                    </Toolbar>

                                    {/* px-5 = MESMO RECUO DO .container-fluid (TOOLBAR E CONTEÚDO). mb-5: A LISTAGEM (ABAS) COMEÇA
                                        SEM ESPAÇO NO TOPO E O CABEÇALHO FICAVA GRUDADO NELA. SÓ RENDERIZA COM CONTEÚDO */}
                                    {/* ABAS DA LISTAGEM ACIMA DO $cabecalhoPagina (VER utils/listTabs) */}
                                    {abasDaListagemNoTopo(pageData) && (
                                        <div className="w-full px-5">
                                            <Tabs tabs={abasDaListagemNoTopo(pageData)} />
                                        </div>
                                    )}

                                    {/* FILTROS EM ARRAY DO CARTÃO ($formCabecalho — VER class/HeaderFilters.php NA API) */}
                                    {pageData?.params?.extra_content?.header_form?.fields?.length > 0 && (
                                        <div className="w-full px-5 mb-5">
                                            <FiltrosCabecalho formulario={pageData.params.extra_content.header_form} />
                                        </div>
                                    )}

                                    {String(headerAfterContent).trim() && (
                                        //flow-root: float DO CARTÃO (ex.: FILTROS ANTIGOS COM float:left/right) FICA DENTRO DO CABEÇALHO,
                                        //SEM VAZAR E ESPREMER A LISTAGEM AO LADO
                                        <LegacyHtml html={headerAfterContent} className="w-full px-5 mb-5 flow-root" />
                                    )}

                                    <Outlet />

                                    {footerContent && (
                                        <LegacyHtml html={footerContent} className="w-full" style={{padding: '10px 30px'}} />
                                    )}

                                </main>

                                <Footer />

                            </div>

                        </div>

                    </div>

                </div>

            </Fragment>
        )
    }

    export { Main }
