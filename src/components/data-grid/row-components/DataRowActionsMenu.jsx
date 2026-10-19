    import { useEffect } from 'react'
    import { cleanUrl } from '@/utils/urlHelper'
    import { transformOldIcon } from '@/lib/transformOldIcon'
    import { OldIcon } from '@/components/legacy/OldIcon'
    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
    import { injectLegacyIconsCss } from '@/utils/legacyIcons'

    const DataRowActionsMenu = ({ row, onRemoveItems }) => {

        //OS ÍCONES DAS AÇÕES VÊM DO SPRITE DO PAINEL ANTIGO (css/icons.css)
        useEffect(() => {
            injectLegacyIconsCss()
        }, [])

        //ÍCONE DO SPRITE DO PAINEL ANTIGO: A PONTE MANDA "figura-black l4 c1" (ÀS VEZES SÓ "l1 c14")
        const spriteDoIcone = (icon) => {
            const linha  = /\bl(\d+)\b/.exec(icon || '')
            const coluna = /\bc(\d+)\b/.exec(icon || '')
            return linha && coluna ? `figura-black l${linha[1]} c${coluna[1]}` : null
        }

        const onClickAcao = (e, item) => {

            const params = new URL(item.url || '', window.location.href).searchParams

            //EXCLUIR É POR API (COM CONFIRMAÇÃO); OS DEMAIS SEGUEM O LINK NORMALMENTE
            if (params.has('excluir')) {
                e.preventDefault()
                e.stopPropagation()
                onRemoveItems?.([params.get('excluir')])
            }

        }

        // AÇÕES LADO A LADO COMO NO PAINEL ANTIGO (Versões, Alterar, Excluir...), COM TOOLTIP NO TÍTULO
        return (
            <>

                <TooltipProvider delayDuration={200}>
                    <div className="inline-flex items-center justify-center gap-2.5">

                        {Array.isArray(row.content) && row.content.length > 0 ? (

                            row.content.map((item, index) => {

                                const sprite = spriteDoIcone(item.icon)
                                const keen   = sprite ? null : transformOldIcon(item.icon)

                                return (
                                    <Tooltip key={index}>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={cleanUrl(item.url) || '#'}
                                                target={item.target || '_self'}
                                                rel={(item.target || '').includes('_blank') ? 'noopener noreferrer' : undefined}
                                                aria-label={item.title}
                                                className="inline-flex items-center opacity-80 hover:opacity-100 transition-opacity"
                                                onClick={(e) => onClickAcao(e, item)}
                                            >
                                                {sprite ? (
                                                    <span className="icones">
                                                        <span className={sprite} />
                                                    </span>
                                                ) : keen?.icon ? (
                                                    <OldIcon icon={keen} />
                                                ) : (
                                                    <span className="text-2sm">{item.title}</span>
                                                )}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-xs py-1 px-2">{item.title}</TooltipContent>
                                    </Tooltip>
                                )

                            })

                        ) : (

                            <span className="text-gray-500">-</span>

                        )}

                    </div>
                </TooltipProvider>
            </>
        )

    }

    export { DataRowActionsMenu }
