    import qs from 'qs'
    import { useEffect } from 'react'
    import { KeenIcon } from '@/components'
    import { buildApiUrl, buildRemoveItemsUrl, cleanUrl } from '@/utils/urlHelper'
    import { api } from '@/services/api'
    import { toast } from 'sonner'
    import { transformOldIcon } from '@/lib/transformOldIcon'
    import { usePageData } from '@/context/PageDataContext'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
    import { injectLegacyIconsCss } from '@/utils/legacyIcons'

    const DataRowActionsMenu = ({ row }) => {

        const { callApi } = usePageData()
        const [confirm, confirmDialog] = useConfirm()

        //OS ÍCONES DAS AÇÕES VÊM DO SPRITE DO PAINEL ANTIGO (css/icons.css)
        useEffect(() => {
            injectLegacyIconsCss()
        }, [])

        const removeRow = async (itemId) => {

            const confirmado = await confirm({
                title: 'Excluir item?',
                description: 'Tem certeza que deseja excluir este item? Essa ação não pode ser desfeita.',
            })

            if (!confirmado) return

            let response = ''
            const data = {
                items: [itemId],
            }

            try {

                response = await api.post(
                    buildRemoveItemsUrl(),
                    qs.stringify(data),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                )

                //SEM success O CARD NÃO EXCLUIU (ex.: RESPONDEU COM <script>window.location=...?erro=...);
                //status false É RECUSA DO PRÓPRIO BACKEND (ex.: SEM PERMISSÃO) E TRAZ A MENSAGEM
                const resultado = response.data?.success?.response
                if (!resultado || resultado.status === false || resultado.data?.status === false) {
                    throw new Error(resultado?.message || resultado?.data?.message || '')
                }

                const urlRefresh = buildApiUrl(
                    new URLSearchParams(window.location.search)
                )

                callApi(urlRefresh)

                toast(`✅ Sucesso`, {
                    description: <span style={{ 'color': 'white' }}>{response.data?.success?.response?.data?.message}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-success',
                        fontWeight: 'bold'
                    }
                })

            } catch (err) {

                toast(`❌ Erro`, {
                    description: <span style={{ 'color': 'white' }}>{err?.message || 'Não foi possível remover este item'}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        fontWeight: 'bold'
                    }
                })

            }

        }

        //ÍCONE DO SPRITE DO PAINEL ANTIGO: A PONTE MANDA "figura-black l4 c1" (ÀS VEZES SÓ "l1 c14")
        const spriteDoIcone = (icon) => {
            const linha  = /\bl(\d+)\b/.exec(icon || '')
            const coluna = /\bc(\d+)\b/.exec(icon || '')
            return linha && coluna ? `figura-black l${linha[1]} c${coluna[1]}` : null
        }

        const onClickAcao = (e, item) => {

            const params = new URLSearchParams(item.url || '')

            //EXCLUIR É POR API (COM CONFIRMAÇÃO); OS DEMAIS SEGUEM O LINK NORMALMENTE
            if (params.has('excluir')) {
                e.preventDefault()
                removeRow(params.get('excluir'))
            }

        }

        // AÇÕES LADO A LADO COMO NO PAINEL ANTIGO (Versões, Alterar, Excluir...), COM TOOLTIP NO TÍTULO
        return (
            <>
                {confirmDialog}

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
                                                    <KeenIcon icon={keen.icon} style={keen.type} />
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
