import { useState } from 'react'

// TOGGLE DE STATUS DA LISTAGEM (equivalente ao altStt() do painel-php).
// Atualização otimista: troca na hora e reverte se o backend recusar (handleToggle devolve false).
export const DataRowToggle = ({ row, handleToggle }) => {

    const [toggleState, setToggleState] = useState(row.content)
    const [salvando, setSalvando]       = useState(false)

    // MANTÉM SINCRONIZADO QUANDO A LISTAGEM É RECARREGADA (troca de página, busca, refresh) — DURANTE O RENDER,
    // SEM UM FRAME COM O STATUS ANTIGO
    const [conteudoAnterior, setConteudoAnterior] = useState(row.content)
    if (row.content !== conteudoAnterior) {
        setConteudoAnterior(row.content)
        setToggleState(row.content)
    }

    const handleToggleItem = async () => {

        if (salvando) return

        const previousState = toggleState

        setToggleState(!previousState)
        setSalvando(true)

        const success = await handleToggle()

        if (success === false) {
            setToggleState(previousState)
        }

        setSalvando(false)

    }

    const ativo = !!toggleState

    return (
        <div className="flex items-center justify-center">

            <button
                type="button"
                role="switch"
                aria-checked={ativo}
                aria-label={ativo ? 'Ativo' : 'Inativo'}
                title={ativo ? 'Ativo — clique para desativar' : 'Inativo — clique para ativar'}
                disabled={salvando}
                onClick={handleToggleItem}
                className={[
                    'relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full',
                    'transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    salvando ? 'opacity-60 cursor-wait' : 'cursor-pointer',
                    ativo ? 'bg-success' : 'bg-gray-300',
                ].join(' ')}
            >

                <span
                    className={[
                        'inline-block h-[16px] w-[16px] rounded-full bg-white shadow-sm',
                        'transition-transform duration-200',
                        ativo ? 'translate-x-[21px]' : 'translate-x-[3px]',
                    ].join(' ')}
                />

            </button>

        </div>
    )

}
