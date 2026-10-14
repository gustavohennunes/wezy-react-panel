    import { useMemo } from 'react'
    import { usePageData } from '@/context/PageDataContext'
    import { Models } from '@/components/list/models'
    import { FormContext } from '@/components/form/FormContext'
    import { DashboardContext } from '@/components/dashboard/DashboardContext'
    import { PicturesContext } from '@/components/pictures/PicturesContext'
    import { ScreenLoader } from '@/components/loaders'
    import { Plans } from '../../account/billing/plans/blocks/Plans'
    import { Com379Content } from './Com379Content'

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
            } else if (extraHtml.length > 0) {
                newContent = <div dangerouslySetInnerHTML={{ __html: extraHtml }} />
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
                        tabs={pageData?.params?.buttons?.list}
                        search={pageData?.params?.search}
                        btnExcluir={pageData?.params?.footer?.delete_button}
                        pagination={pageData?.params?.pagination}
                        sequence={pageData?.params?.sequence === true}
                    />
                )
            }

            return newContent

        }, [pageData])

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
