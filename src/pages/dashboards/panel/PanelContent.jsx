    import { useEffect, useMemo } from 'react'
    import { usePageData } from '@/context/PageDataContext'
    import { abasDaListagemNoTopo } from '@/utils/listTabs'
    import { Models } from '@/components/list/models'
    import { FormContext } from '@/components/form/FormContext'
    import { DashboardContext } from '@/components/dashboard/DashboardContext'
    import { PicturesContext } from '@/components/pictures/PicturesContext'
    import { ScreenLoader } from '@/components/loaders'
    import { Plans } from '../../account/billing/plans/blocks/Plans'
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

    const PanelContent = () => {
        
        const { pageData, loading } = usePageData()
        //DERIVADO NO RENDER (useMemo) E NÃO COPIADO PARA UM STATE POR useEffect: COM O EFFECT, O RENDER QUE
        //TIRAVA O LOADER AINDA MOSTRAVA O CONTEÚDO ANTERIOR (A LISTA VAZIA DO PRIMEIRO RENDER, COM
        //"Nenhum conteúdo encontrado!") POR ALGUNS FRAMES ATÉ O EFFECT TROCAR PELO NOVO
        const content = useMemo(() => {

            let newContent = ''

            //A PONTE EMITE A CHAVE COM HÍFEN (PanelModule.php:10). O UNDERSCORE FICA
            //ACEITO POR COMPATIBILIDADE COM RETORNOS ANTIGOS.
            const extraHtml = pageData?.['extra-html-content'] || pageData?.extra_html_content || ''

            if (pageData?.layout === 'com379' && pageData?.params?.com379) {
                newContent = <Com379Content data={pageData.params.com379} />
            } else if (pageData?.params?.photos && Array.isArray(pageData.params.photos.items)) {
                //GALERIA DO framework/fotos.php COMO DADOS (PanelModule::buildPhotosData): GALERIA EM REACT COM @dnd-kit.
                //O extra-html-content (HTML DO fotos.php) TAMBÉM VEM, MAS SÓ É USADO SEM ESTES DADOS
                newContent = <PicturesGallery data={pageData.params.photos} />
            } else if (Array.isArray(pageData?.params?.charts) && pageData.params.charts.length > 0) {
                //$chartsConfig DO CARTÃO COMO DADOS (PanelModule::buildChartsData): GRÁFICOS EM COMPONENTES REACT.
                //O extra-html-content (HTML DO framework/charts.php) TAMBÉM VEM, MAS SÓ É USADO SEM ESTES DADOS
                newContent = <ChartsContent cards={pageData.params.charts} />
            } else if (extraHtml.length > 0) {
                //GRÁFICOS, FUNIL E FOTOS (layout html) VÊM COM O HTML DO PAINEL LEGADO, COM SCRIPTS
                newContent = <LegacyHtml html={extraHtml} />
            } else if (pageData?.layout === 'dashboard') {
                newContent = <DashboardContext />
            } else if (pageData?.layout === 'plans') {
                newContent = <Plans />
            } else if (pageData?.layout === 'photos') {
                newContent = <PicturesContext data={pageData?.params} />
            } else if (pageData?.layout === 'funnel') {
                newContent = <FormContext data={pageData?.params} />
            } else if (pageData?.layout === 'form') {
                newContent = <FormContext data={pageData?.params} />
            } else {
                newContent = (
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
            }

            //O QUE O CARTÃO IMPRIMIU (echo) VEM ANTES DO CONTEÚDO, COMO NO PAINEL LEGADO
            const outputHtml = pageData?.['output-html'] || ''
            if (outputHtml.trim().length > 0) {

                //TELA FEITA SÓ POR echo ($lista = false SEM CAMPOS): NÃO MOSTRA O FORMULÁRIO VAZIO
                const formularioVazio = pageData?.layout === 'form' && !(pageData?.params?.form?.fields?.length > 0)

                return (
                    <>
                        <LegacyHtml html={outputHtml} className={temConteudoVisivel(outputHtml) ? 'legacy-output mb-5' : 'legacy-output'} />
                        {formularioVazio ? null : newContent}
                    </>
                )

            }

            return newContent

        }, [pageData])

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
            <div className="grid gap-5 lg:gap-7.5">
                <div className="grid gap-5 lg:gap-7.5 items-stretch">
                    <div className="lg:col-span-2">{content}</div>
                </div>
            </div>
        )

    }

    export { PanelContent }
