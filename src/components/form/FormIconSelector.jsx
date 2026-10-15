    import { useEffect, useMemo, useState } from 'react'
    import clsx from 'clsx'
    import { OldIcon } from '@/components/legacy/OldIcon'
    import { OLD_ICON_MAP, OLD_ICON_OPTIONS, transformOldIcon } from '@/lib/transformOldIcon'

    // SELETOR DE ÍCONE DO EDITOR DE MÓDULOS (?pag=modulos&acao=Alterar, CAMPO `aut` "Icone").
    // O CARTÃO wezy-panel/arquivos/modulos/1/modulos-main.php (getModuleIcons) IMPRIME A GRADE DE SPRITES ANTIGOS
    // E OS HIDDEN FrmIconeX/FrmIconeY. AQUI A GRADE VIRA KEENICONS/lucide — A MESMA CONVERSÃO DO MENU (transformOldIcon) —
    // E OS HIDDEN CONTINUAM INDO NO POST COM coluna/linha, COMO NO PAINEL ANTIGO. O CARTÃO NÃO MUDA.

    //coluna/linha GRAVADAS NO MÓDULO, LIDAS DOS HIDDEN DO HTML DO CARTÃO
    const lerPosicao = (html) => {

        const doc = new DOMParser().parseFromString(html || '', 'text/html')

        return {
            coluna: doc.getElementById('FrmIconeX')?.value || '',
            linha:  doc.getElementById('FrmIconeY')?.value || '',
        }

    }

    const FormIconSelector = ({ html, className = '' }) => {

        const inicial = useMemo(() => lerPosicao(html), [html])
        const [posicao, setPosicao] = useState(inicial)

        useEffect(() => {
            setPosicao(inicial)
        }, [inicial])

        const temPosicao = posicao.coluna !== '' && posicao.linha !== ''
        const atual      = OLD_ICON_MAP[`${posicao.linha}/${posicao.coluna}`] || ''
        const preview    = transformOldIcon(`c${posicao.coluna} l${posicao.linha}`)

        return (
            <div className={clsx('flex flex-col gap-3 w-full max-w-[700px]', className)}>

                <div className="flex items-center gap-3">
                    <div
                        className={clsx(
                            'flex items-center justify-center size-10 shrink-0 rounded-lg border text-xl',
                            atual ? 'border-primary bg-primary-light text-primary' : 'border-dashed border-gray-300 text-gray-500'
                        )}
                    >
                        <OldIcon icon={preview} />
                    </div>
                    <div className="flex flex-col gap-0.5 text-2sm">
                        {atual ? (
                            <span className="font-medium text-gray-900">Ícone selecionado</span>
                        ) : temPosicao ? (
                            <>
                                <span className="font-medium text-gray-900">Ícone atual fora da grade</span>
                                <span className="text-gray-500">Coluna {posicao.coluna}, linha {posicao.linha}. Ele é mantido até você escolher outro abaixo.</span>
                            </>
                        ) : (
                            <span className="font-medium text-gray-900">Nenhum ícone selecionado</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1.5">
                    {OLD_ICON_OPTIONS.map((opcao) => {

                        const selecionado = opcao.name === atual

                        return (
                            <button
                                key={opcao.name}
                                type="button"
                                title={opcao.icon}
                                aria-label={opcao.icon}
                                aria-pressed={selecionado}
                                onClick={() => setPosicao({ coluna: opcao.coluna, linha: opcao.linha })}
                                className={clsx(
                                    'flex items-center justify-center h-8 rounded-md border text-base transition-colors',
                                    selecionado
                                        ? 'border-primary bg-primary-light text-primary'
                                        : 'border-gray-200 text-gray-600 hover:border-primary hover:bg-primary-light hover:text-primary'
                                )}
                            >
                                <OldIcon icon={opcao} />
                            </button>
                        )

                    })}
                </div>

                <input id="FrmIconeX" name="FrmIconeX" type="hidden" value={posicao.coluna} />
                <input id="FrmIconeY" name="FrmIconeY" type="hidden" value={posicao.linha} />

            </div>
        )

    }

    export { FormIconSelector }
