import { useEffect, useState } from 'react'
import { usePageData } from '@/context/PageDataContext'
import { Models } from '@/components/list/models'
import { FormContext } from '@/components/form/FormContext'
import { ScreenLoader } from '@/components/loaders'

const PanelContent = () => {
    const { pageData, loading } = usePageData()
    const [content, setContent] = useState(null)

    useEffect(() => {
        let newContent = ''

        if (pageData?.layout === 'galeria' || pageData?.layout === 'link') {
            newContent = 'Em breve'
        } else if (pageData?.layout === 'form') {
            newContent = <FormContext data={pageData?.params} />
        } else {
            newContent = (
                <Models
                    model={pageData?.params?.list?.rows || []}
                    columnHeader={pageData?.params?.list?.header}
                    btnAdd={pageData?.params?.add_button}
                    tabs={pageData?.params?.buttons?.list}
                    search={pageData?.params?.search}
                    btnExcluir={pageData?.params?.footer}
                    pagination={pageData?.params?.pagination}
                />
            )
        }

        setContent(newContent)
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
