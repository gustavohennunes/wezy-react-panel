    import { useEffect, useId, useRef, useState } from 'react'
    import { Check } from 'lucide-react'
    import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
    import { cn } from '@/lib/utils'

    // SUGESTÕES PRESAS A UM INPUT DE TEXTO (sugestoes = [{ value, description }]): CLICAR OU DESCER COM A SETA ABRE A LISTA;
    // O CAMPO CONTINUA DIGITÁVEL PARA VALORES QUE AINDA NÃO ESTÃO NELA. O INPUT PODE SER DO REACT (CampoComSugestoes, ÍNDICE 11
    // DO Frm NO CARTÃO) OU DO HTML DO CARTÃO (data-sugestoes, VER LegacyInputSugestoes): OS EVENTOS VÃO DIRETO NO ELEMENTO

    // titulo: CABEÇALHO OPCIONAL DA LISTA (ex.: "Possíveis variáveis")
    const SugestoesDoInput = ({ inputRef, sugestoes, valor, onEscolher, titulo }) => {

        const [aberto, setAberto]       = useState(false)
        const [destacada, setDestacada] = useState(-1)
        const listaId                   = useId()

        //O ESTADO MAIS RECENTE PARA OS LISTENERS NATIVOS (REGISTRADOS UMA VEZ SÓ)
        const estado = useRef({})
        estado.current = { aberto, destacada, sugestoes, valor, onEscolher }

        const escolhe = (sugestao) => {
            estado.current.onEscolher(sugestao.value)
            setAberto(false)
            inputRef.current?.focus()
        }

        useEffect(() => {

            const input = inputRef.current
            if (!input) return

            const abre = () => {
                const { sugestoes, valor } = estado.current
                setDestacada(sugestoes.findIndex((sugestao) => sugestao.value === valor))
                setAberto(true)
            }

            const aoClicar = () => (estado.current.aberto ? setAberto(false) : abre())

            const aoTeclar = (e) => {

                const { aberto, destacada, sugestoes } = estado.current

                if (e.key === 'Escape' && aberto) {
                    e.preventDefault()
                    setAberto(false)
                    return
                }

                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    if (!aberto) {
                        abre()
                        return
                    }
                    const passo = e.key === 'ArrowDown' ? 1 : -1
                    setDestacada((atual) => (atual + passo + sugestoes.length) % sugestoes.length)
                    return
                }

                //ENTER COM UMA SUGESTÃO DESTACADA ESCOLHE ELA EM VEZ DE ENVIAR O FORMULÁRIO
                if (e.key === 'Enter' && aberto && destacada >= 0) {
                    e.preventDefault()
                    escolhe(sugestoes[destacada])
                }

            }

            input.setAttribute('role', 'combobox')
            input.setAttribute('aria-autocomplete', 'list')
            input.setAttribute('aria-controls', listaId)
            input.setAttribute('autocomplete', 'off')
            input.addEventListener('click', aoClicar)
            input.addEventListener('keydown', aoTeclar)

            return () => {
                input.removeEventListener('click', aoClicar)
                input.removeEventListener('keydown', aoTeclar)
            }

        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [inputRef, listaId])

        useEffect(() => {
            inputRef.current?.setAttribute('aria-expanded', String(aberto))
        }, [inputRef, aberto])

        return (
            <Popover open={aberto} onOpenChange={setAberto}>

                <PopoverAnchor virtualRef={inputRef} />

                <PopoverContent
                    align="start"
                    className="w-[--radix-popover-trigger-width] min-w-[260px] max-w-[525px] p-1"
                    //O FOCO FICA NO INPUT PARA CONTINUAR DIGITANDO COM A LISTA ABERTA
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                        if (e.target === inputRef.current) e.preventDefault()
                    }}
                >
                    {titulo && (
                        <div className="px-2.5 pt-1.5 pb-1 text-2xs font-semibold uppercase tracking-wide text-gray-500">
                            {titulo}
                        </div>
                    )}
                    <ul id={listaId} role="listbox" aria-label={titulo || undefined} className="scrollable-y-auto max-h-72 [--tw-scrollbar-thumb-color:var(--tw-gray-300)]">
                        {sugestoes.map((sugestao, indice) => {

                            const selecionada = sugestao.value === valor

                            return (
                                <li
                                    key={sugestao.value}
                                    role="option"
                                    aria-selected={selecionada}
                                    className={cn(
                                        'flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5',
                                        indice === destacada && 'bg-gray-100',
                                        selecionada && 'bg-primary-light'
                                    )}
                                    onMouseEnter={() => setDestacada(indice)}
                                    //pointerdown NÃO TIRA O FOCO DO INPUT
                                    onPointerDown={(e) => e.preventDefault()}
                                    onClick={() => escolhe(sugestao)}
                                >
                                    <Check className={cn('mt-0.5 size-4 shrink-0 text-primary', !selecionada && 'opacity-0')} />
                                    <span className="flex min-w-0 flex-col">
                                        <span className={cn('text-[0.8125rem] font-semibold break-all', selecionada ? 'text-primary' : 'text-gray-900')}>
                                            {sugestao.value}
                                        </span>
                                        {sugestao.description && (
                                            <span className="text-xs text-gray-600">{sugestao.description}</span>
                                        )}
                                    </span>
                                </li>
                            )

                        })}
                    </ul>
                </PopoverContent>

            </Popover>
        )

    }

    const CampoComSugestoes = ({ sugestoes, valor, onValor, className, ...inputProps }) => {

        const inputRef = useRef(null)

        return (
            <>
                <input
                    {...inputProps}
                    ref={inputRef}
                    type="text"
                    className={className}
                    value={valor || ''}
                    onChange={(e) => onValor(e.target.value)}
                />
                <SugestoesDoInput inputRef={inputRef} sugestoes={sugestoes} valor={valor} onEscolher={onValor} />
            </>
        )

    }

    export { CampoComSugestoes, SugestoesDoInput }
