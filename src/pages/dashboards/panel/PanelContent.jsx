    import { memo, useEffect } from 'react'
    import { usePageData } from '@/context/PageDataContext'
    import { abasDaListagemNoTopo } from '@/utils/listTabs'
    import { Models } from '@/components/list/models'
    import { FormContext } from '@/components/form/FormContext'
    import { DashboardContext } from '@/components/dashboard/DashboardContext'
    import { ScreenLoader } from '@/components/loaders'
    import { Com379Content } from './Com379Content'
    import { ChartsContent } from './ChartsContent'
    import { PicturesGallery } from '@/components/pictures/PicturesGallery'
    import { LegacyHtml } from '@/components/legacy/LegacyHtml'
    import { registrarRecente } from '@/utils/modulosRecentes'

    //O echo DO CARTÃO MUITAS VEZES É SÓ <script>/<style> (ex.: 1/modulos): NADA APARECE NA TELA E O mb-5
    //DEIXAVA UM VÃO ACIMA DO CONTEÚDO. OS SCRIPTS CONTINUAM RODANDO — SÓ O ESPAÇAMENTO DEPENDE DISTO
    const temConteudoVisivel = (html) =>
        html
            .replace(/<script\b[\s\S]*?<\/script>/gi, '')
            .replace(/<style\b[\s\S]*?<\/style>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .trim().length > 0

    //LISTAGEM PADRÃO DO CARTÃO
    const ListagemDoModulo = ({ pageData }) => (
        <Models
            model={pageData?.params?.list?.rows || []}
            columnHeader={pageData?.params?.list?.header}
            content={pageData?.params?.list?.content}
            btnAdd={pageData?.params?.add_button}
            //ABAS QUE O Main JÁ MOSTRA NO TOPO (ACIMA DO $cabecalhoPagina) SAEM DO CARD
            tabs={abasDaListagemNoTopo(pageData) ? { ...pageData.params.buttons.list, before: false } : pageData?.params?.buttons?.list}
            search={pageData?.params?.search}
            btnExcluir={pageData?.params?.footer?.delete_button}
            extraButton={pageData?.params?.footer?.extra_button}
            pagination={pageData?.params?.pagination}
            sequence={pageData?.params?.sequence === true}
        />
    )

    //O QUE A TELA MOSTRA, CONFORME O QUE A PONTE MANDOU (DADOS ESTRUTURADOS PRIMEIRO, DEPOIS O HTML DO LEGADO, DEPOIS O layout)
    const conteudoPrincipal = (pageData) => {

        const params = pageData?.params

        //A PONTE EMITE A CHAVE COM HÍFEN (PanelModule.php:10). O UNDERSCORE FICA
        //ACEITO POR COMPATIBILIDADE COM RETORNOS ANTIGOS.
        const extraHtml = pageData?.['extra-html-content'] || pageData?.extra_html_content || ''

        if (pageData?.layout === 'com379' && params?.com379) return <Com379Content data={params.com379} />

        //GALERIA DO framework/fotos.php COMO DADOS (PanelModule::buildPhotosData): GALERIA EM REACT COM @dnd-kit.
        //O extra-html-content (HTML DO fotos.php) TAMBÉM VEM, MAS SÓ É USADO SEM ESTES DADOS
        if (params?.photos && Array.isArray(params.photos.items)) return <PicturesGallery data={params.photos} />

        //$chartsConfig DO CARTÃO COMO DADOS (PanelModule::buildChartsData): GRÁFICOS EM COMPONENTES REACT.
        //O extra-html-content (HTML DO framework/charts.php) TAMBÉM VEM, MAS SÓ É USADO SEM ESTES DADOS
        if (Array.isArray(params?.charts) && params.charts.length > 0) return <ChartsContent cards={params.charts} />

        //GRÁFICOS, FUNIL E FOTOS (layout html) VÊM COM O HTML DO PAINEL LEGADO, COM SCRIPTS
        if (extraHtml.length > 0) return <LegacyHtml html={extraHtml} />

        switch (pageData?.layout) {
            case 'dashboard':
                return <DashboardContext />
            //layout photos SEM params.photos: A MESMA GALERIA, VAZIA (O ENVIO E A RECARGA USAM A URL DA TELA)
            case 'photos':
                return <PicturesGallery />
            case 'funnel':
            case 'form':
                return <FormContext data={params} />
            default:
                return <ListagemDoModulo pageData={pageData} />
        }

    }

    //memo: SÓ REFAZ A TELA QUANDO CHEGA OUTRO pageData (NÃO A CADA RENDER DO PanelContent)
    const ConteudoDoModulo = memo(({ pageData }) => {

        const principal = conteudoPrincipal(pageData)

        //O QUE O CARTÃO IMPRIMIU (echo) VEM ANTES DO CONTEÚDO, COMO NO PAINEL LEGADO
        const outputHtml = pageData?.['output-html'] || ''
        if (outputHtml.trim().length === 0) return principal

        //TELA FEITA SÓ POR echo ($lista = false SEM CAMPOS): NÃO MOSTRA O FORMULÁRIO VAZIO
        const formularioVazio = pageData?.layout === 'form' && !(pageData?.params?.form?.fields?.length > 0)

        return (
            <>
                <LegacyHtml html={outputHtml} className={temConteudoVisivel(outputHtml) ? 'legacy-output mb-5' : 'legacy-output'} />
                {formularioVazio ? null : principal}
            </>
        )

    })
    ConteudoDoModulo.displayName = 'ConteudoDoModulo'

    //CONTEÚDO DERIVADO NO RENDER E NÃO COPIADO PARA UM STATE POR useEffect: COM O EFFECT, O RENDER QUE TIRAVA O LOADER
    //AINDA MOSTRAVA O CONTEÚDO ANTERIOR (A LISTA VAZIA DO PRIMEIRO RENDER, COM "Nenhum conteúdo encontrado!") POR ALGUNS
    //FRAMES ATÉ O EFFECT TROCAR PELO NOVO
    const PanelContent = () => {

        const { pageData, loading } = usePageData()

        //"RECENTES" DO DASHBOARD: SÓ MÓDULO QUE CARREGOU (pageData DA API), NÃO QUALQUER URL DIGITADA
        useEffect(() => {
            if (!loading && pageData) {
                registrarRecente(new URLSearchParams(window.location.search).get('pag'))
            }
        }, [pageData, loading])

        if (loading) {
            return <ScreenLoader />
        }

        return (
            //min-w-0 NOS ITENS DO GRID: CONTEÚDO LARGO (ex.: COLUNAS DO FUNIL) ALARGAVA A PÁGINA INTEIRA, E O CABEÇALHO E OS
            //FILTROS ESTICAVAM JUNTO. ASSIM SÓ O PRÓPRIO CONTEÚDO ROLA NA HORIZONTAL (VER .geral NO globals.css)
            <div className="grid gap-5 lg:gap-7.5">
                <div className="grid gap-5 lg:gap-7.5 items-stretch min-w-0">
                    <div className="lg:col-span-2 min-w-0"><ConteudoDoModulo pageData={pageData} /></div>
                </div>
            </div>
        )

    }

    export { PanelContent }
