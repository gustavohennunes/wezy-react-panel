import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { cleanUrl } from '@/utils/urlHelper'

const Tabs = ({ activeTab, setActiveTab, className, tabs }) => {

    const containerRef = useRef(null)

    //EM TELAS ESTREITAS AS ABAS ROLAM NA HORIZONTAL; A ATIVA FICA VISÍVEL (SEM MEXER NA ROLAGEM DA PÁGINA)
    useEffect(() => {

        const container = containerRef.current
        const ativa = container?.querySelector('.tab.active')
        if (!container || !ativa) return

        const inicio = ativa.offsetLeft - container.offsetLeft
        const fim = inicio + ativa.offsetWidth

        if (inicio < container.scrollLeft || fim > container.scrollLeft + container.clientWidth) {
            container.scrollLeft = inicio - 24
        }

    }, [tabs])

    if (!tabs || !Array.isArray(tabs)) {
        return null
    }

    return (
        <div
            ref={containerRef}
            data-tabs="true"
            className={cn(
                className ? className : 'tabs w-f mb-3',
                'overflow-x-auto overflow-y-hidden [scrollbar-width:thin]'
            )}
        >
            {tabs?.map((tab, i) => {

                const isInvalidUrl = !tab.url || tab.url === 'javascript:;'

                return isInvalidUrl ? (
                    <button
                        key={i}
                        className={`active tab shrink-0 whitespace-nowrap`}
                    >
                        {tab.content}
                    </button>
                ) : (
                    <a
                        key={i}
                        className={`tab shrink-0 whitespace-nowrap`}
                        href={cleanUrl(tab.url)}
                        target={tab.target ?? '_self'}
                    >
                        {tab.content}
                    </a>
                )

            })}
        </div>
    )
}

export { Tabs }
