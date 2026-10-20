import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { cleanUrl } from '@/utils/urlHelper'
import { comChaves } from '@/utils/chavesUnicas'

const Tabs = ({ className, tabs }) => {

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
            {comChaves(tabs, (tab) => `${tab.url || ''}|${tab.categoria || ''}|${tab.content}`).map(({ item: tab, chave }) => {

                const isInvalidUrl = !tab.url || tab.url === 'javascript:;'

                //ABA QUE TROCA CONTEÚDO NA MESMA TELA (ex.: ABAS DE CATEGORIA DO FormContext): BOTÃO, ATIVA PELO tab.ativa
                if (tab.onClick) {
                    return (
                        <button
                            key={chave}
                            type="button"
                            className={`tab shrink-0 whitespace-nowrap${tab.ativa ? ' active' : ''}`}
                            onClick={tab.onClick}
                        >
                            {tab.content}
                        </button>
                    )
                }

                return isInvalidUrl ? (
                    <button
                        key={chave}
                        type="button"
                        className={`active tab shrink-0 whitespace-nowrap`}
                    >
                        {tab.content}
                    </button>
                ) : (
                    <a
                        key={chave}
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
