    import { useId, useState } from 'react'
    import { Check, ChevronDown, X } from 'lucide-react'
    import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
    import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { cn } from '@/lib/utils'
    import { normalizaTexto, contemTodasAsPalavras } from '@/utils/textSearch'

    // SUBSTITUI O select2 DO PAINEL ANTIGO (wezy-panel/jscripts/painel.js):
    // - BUSCA POR PALAVRAS: "cli ativo" ACHA OPÇÕES QUE TENHAM AS DUAS, EM QUALQUER ORDEM (customMatcher)
    // - QUADRADINHO DE COR QUANDO O value É #hex, var(...) OU color-* (formatColor)
    // - multiple: VALORES VIRAM BADGES; creatable: PERMITE CRIAR VALORES NOVOS (select-tag / tags:true)
    // - onRemoveOption: OPÇÃO COM removable: true GANHA UM X NA LISTA (TAG ERRADA, SALVA OU CRIADA AGORA, SAI SEM RECARREGAR)

    const normaliza = normalizaTexto

    //customMatcher DO select2: TODAS AS PALAVRAS DIGITADAS PRECISAM APARECER NO TEXTO DA OPÇÃO
    const filtroPorPalavras = (value, search, keywords = []) =>
        contemTodasAsPalavras(keywords.join(' '), search) ? 1 : 0

    //formatColor DO select2
    const corDaOpcao = (value) => {

        const valor = String(value ?? '').trim()

        if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(valor) || /^var\(.+\)$/.test(valor)) {
            return valor
        }

        if (/^color-([a-zA-Z0-9-]+)$/.test(valor)) {
            return `var(--${valor})`
        }

        return null

    }

    //quebra: NA LISTA DO POPOVER O TEXTO QUEBRA LINHA PARA A OPÇÃO SER LIDA INTEIRA;
    //NO GATILHO (ALTURA FIXA h-10) CONTINUA TRUNCADO COM "…"
    //corExtra: COR QUE O value NÃO DIZ SOZINHO (ex.: ESTILO DE COR DA FOLHA DE ESTILO, VER FormSelect). DEVOLVE
    //{ cor, opacidade } OU null
    const LabelComCor = ({ option, quebra = false, corExtra }) => {

        const extra = corDaOpcao(option?.value) ? null : corExtra?.(option)
        const cor   = corDaOpcao(option?.value) || extra?.cor

        return (
            <span className="flex items-center gap-2.5 min-w-0">
                {cor && (
                    <span
                        className="inline-block size-[15px] shrink-0 rounded-[3px] border border-[#ccc]"
                        style={{ backgroundColor: cor, opacity: extra?.opacidade ?? 1 }}
                    />
                )}
                <span className={quebra ? 'min-w-0 whitespace-normal break-words' : 'truncate'}>{option?.label}</span>
            </span>
        )

    }

    const Combobox = ({
        options = [],
        value,
        onChange,
        multiple = false,
        creatable = false,
        placeholder = 'Selecione uma opção',
        disabled = false,
        ariaLabel,
        onRemoveOption,
        corExtra,
    }) => {

        const [open, setOpen]     = useState(false)
        const listaId             = useId()
        const [search, setSearch] = useState('')
        const [confirm, confirmDialog] = useConfirm()

        //X DA LISTA: CONFIRMA ANTES (O X DO CHIP NO CAMPO SÓ DESMARCA, SEM PERGUNTAR). FECHA A LISTA PRIMEIRO PARA O
        //MODAL NÃO DISPUTAR FOCO COM O POPOVER
        const confirmaRemocao = async (option) => {
            setOpen(false)
            setSearch('')
            const confirmou = await confirm({
                title: 'Remover opção?',
                description: `"${option.label}" sai da lista e da seleção. Ao salvar o formulário, sai também do registro.`,
                confirmText: 'Remover',
                cancelText: 'Cancelar',
            })
            if (confirmou) onRemoveOption(option)
        }

        const selecionados = multiple ? (value || []).map(String) : []
        const atual        = multiple ? null : options.find((option) => String(option.value) === String(value ?? ''))

        const estaSelecionado = (option) =>
            multiple ? selecionados.includes(String(option.value)) : String(option.value) === String(value ?? '')

        const escolhe = (option) => {

            if (multiple) {

                const valor = String(option.value)
                onChange(selecionados.includes(valor) ? selecionados.filter((item) => item !== valor) : [...selecionados, valor])
                setSearch('')

            } else {

                onChange(option.value)
                setOpen(false)

            }

        }

        const termo        = search.trim()
        const podeCriar    = creatable && termo !== '' &&
            !options.some((option) => normaliza(option.label) === normaliza(termo) || String(option.value) === termo)

        const labelDoValor = (valor) =>
            options.find((option) => String(option.value) === valor) || { label: valor, value: valor }

        return (
            <>
            <Popover open={open} onOpenChange={(aberto) => { setOpen(aberto); if (!aberto) setSearch('') }}>

                <PopoverTrigger asChild disabled={disabled}>
                    <div
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listaId}
                        aria-label={ariaLabel}
                        aria-disabled={disabled}
                        tabIndex={disabled ? -1 : 0}
                        onKeyDown={(e) => {
                            if (!disabled && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
                                e.preventDefault()
                                setOpen(true)
                            }
                        }}
                        className={cn(
                            'input flex w-full cursor-pointer items-center justify-between gap-2 text-[0.8125rem] font-medium hover:border-gray-400',
                            multiple ? 'min-h-10 h-auto py-1.5 flex-wrap' : 'h-10',
                            open && 'border-primary',
                            disabled && 'pointer-events-none opacity-50'
                        )}
                    >

                        {multiple ? (

                            <span className="flex flex-1 flex-wrap gap-1.5 min-w-0">

                                {selecionados.length === 0 && (
                                    <span className="text-gray-500 font-normal">{placeholder}</span>
                                )}

                                {selecionados.map((valor) => (
                                    <span key={valor} className="badge flex items-center gap-1.5 max-w-full px-2 py-1 text-2sm font-medium !text-[var(--form-control-text)] !bg-gray-200 !border-gray-300">
                                        <LabelComCor option={labelDoValor(valor)} corExtra={corExtra} />
                                        <button
                                            type="button"
                                            aria-label="Remover"
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onChange(selecionados.filter((item) => item !== valor))
                                            }}
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </span>
                                ))}

                            </span>

                        ) : (

                            <span className={cn('flex-1 min-w-0', !atual && 'text-gray-500 font-normal')}>
                                {atual ? <LabelComCor option={atual} corExtra={corExtra} /> : placeholder}
                            </span>

                        )}

                        <ChevronDown className="size-4 shrink-0 opacity-50" />

                    </div>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-[--radix-popover-trigger-width] min-w-[220px] p-0">

                    <Command filter={filtroPorPalavras}>

                        <CommandInput
                            placeholder={creatable ? 'Buscar ou criar…' : 'Buscar…'}
                            value={search}
                            onValueChange={setSearch}
                            onKeyDown={(e) => {
                                //ENTER SEM NENHUMA OPÇÃO NA LISTA CRIA A TAG (COMPORTAMENTO DO select2 tags:true)
                                if (e.key === 'Enter' && podeCriar && !document.querySelector('[cmdk-item][data-selected="true"]')) {
                                    e.preventDefault()
                                    escolhe({ label: termo, value: termo })
                                }
                            }}
                        />

                        {/* SCROLL FINO DO TEMA (plugins/components/scrollable.js) EM VEZ DO NATIVO; gray-300 PARA O
                            THUMB FICAR VISÍVEL SOBRE O FUNDO DO POPOVER NOS DOIS MODOS */}
                        <CommandList id={listaId} className="scrollable-y-auto [--tw-scrollbar-thumb-color:var(--tw-gray-300)]">

                            {!podeCriar && <CommandEmpty>Nenhum resultado</CommandEmpty>}

                            <CommandGroup>

                                {options.map((option, index) => (
                                    <CommandItem
                                        key={`${index}-${option.value}`}
                                        value={`${index}-${option.value}`}
                                        keywords={[String(option.label ?? '')]}
                                        onSelect={() => escolhe(option)}
                                    >
                                        <Check className={cn('shrink-0', estaSelecionado(option) ? 'opacity-100' : 'opacity-0')} />
                                        <LabelComCor option={option} quebra corExtra={corExtra} />
                                        {option.removable && onRemoveOption && (
                                            <button
                                                type="button"
                                                aria-label={`Remover "${option.label}"`}
                                                title="Remover"
                                                className="ms-auto flex size-5 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-danger"
                                                //O cmdk SELECIONA O ITEM NO pointerdown/click: O X NÃO PODE MARCAR A OPÇÃO
                                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmaRemocao(option) }}
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        )}
                                    </CommandItem>
                                ))}

                                {podeCriar && (
                                    <CommandItem
                                        forceMount
                                        value="__criar__"
                                        onSelect={() => escolhe({ label: termo, value: termo })}
                                    >
                                        <span className="min-w-0 whitespace-normal break-words">Criar &quot;{termo}&quot;</span>
                                    </CommandItem>
                                )}

                            </CommandGroup>

                        </CommandList>

                    </Command>

                </PopoverContent>

            </Popover>
            {confirmDialog}
            </>
        )

    }

    export { Combobox }
