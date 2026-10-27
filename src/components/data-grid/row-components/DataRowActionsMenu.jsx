    import { useEffect } from 'react'
    import { cleanUrl } from '@/utils/urlHelper'
    import { alvoDoLink, relDoAlvo } from '@/utils/alvoDoLink'
    import { comChaves } from '@/utils/chavesUnicas'
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

        //AÇÃO MONTADA PELO CARTÃO EM HTML (verifyEdit() DEVOLVENDO O PRÓPRIO <a>, ex.: "Visualizar" DO planos-comerciais-atividades
        //DO 360): A PONTE MANDA { content: html }, SEM url/icon/title, E O transformOldIcon(undefined) DERRUBAVA A TELA. TIRA DO
        //HTML O LINK, O ALVO, O TÍTULO DO TOOLTIP E O ÍCONE DO SPRITE (figura-black lX cY)
        const acaoDoHtml = (item) => {
            if (typeof item?.content !== 'string' || item.url !== undefined) return item
            const html  = new DOMParser().parseFromString(item.content, 'text/html')
            const link  = html.querySelector('a')
            const icone = html.querySelector('[class*="figura-"]')
            return {
                url: link?.getAttribute('href') || '',
                target: link?.getAttribute('target') || '',
                title: link?.getAttribute('data-original-title') || link?.getAttribute('title') || link?.textContent?.trim() || '',
                icon: icone?.getAttribute('class') || '',
            }
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
                    <div className="inline-flex items-center justify-center gap-px">

                        {Array.isArray(row.content) && row.content.length > 0 ? (

                            comChaves(row.content.map(acaoDoHtml), (acao) => `${acao.url}|${acao.title}`).map(({ item, chave }) => {

                                const sprite = spriteDoIcone(item.icon)
                                const keen   = sprite ? null : transformOldIcon(item.icon)

                                return (
                                    <Tooltip key={chave}>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={cleanUrl(item.url) || '#'}
                                                target={alvoDoLink(item.target)}
                                                rel={relDoAlvo(item.target)}
                                                aria-label={item.title}
                                                //ÁREA DE CLIQUE 28x28 EM VOLTA DO ÍCONE (ANTES SÓ O ÍCONE DE ~16px RESPONDIA AO CLIQUE)
                                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md opacity-80 hover:opacity-100 hover:bg-gray-100 transition-[opacity,background-color]"
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
