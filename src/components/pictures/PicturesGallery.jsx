    import { useEffect, useRef, useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { toast } from 'sonner'
    import clsx from 'clsx'
    import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
    import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
    import { CSS } from '@dnd-kit/utilities'
    import { KeenIcon } from '@/components/keenicons'
    import { CustomCheckbox } from '@/components/form/CustomFields'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { api } from '@/services/api'
    import { buildApiUrl, cleanUrl } from '@/utils/urlHelper'
    import { LEGACY_ORIGIN } from '@/utils/legacyIcons'

    // GALERIA DE FOTOS DOS CARTÕES (framework/fotos.php NO LEGADO: ?acao=Fotos E CARTÕES SÓ DE FOTOS). A API MANDA AS
    // FOTOS EM params.photos (PanelModule::buildPhotosData) E AS AÇÕES USAM AS MESMAS ROTAS DO LEGADO:
    //   ENVIO     → POST NA URL ATUAL COM FrmFoto[] + Enviar=ok (E FrmLink / FrmLegenda QUANDO O CARTÃO PEDE)
    //   EXCLUSÃO  → GET NA URL ATUAL COM excluir=id|id
    //   ORDEM     → GET acao=arrumaListagem&lista=|id|id (actionSortGallery)

    const dadosDaResposta = (response) => response?.data?.success?.response?.data

    const mensagemErro = (texto) => toast.error(texto || 'Não foi possível concluir a operação.')

    //ÁREA DE ARRASTO: SÓ MOVE DEPOIS DE 6px (CLIQUE NO CHECKBOX OU NO "ABRIR" NÃO VIRA ARRASTO)
    const useSensores = () => useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const Miniatura = ({ foto, arrastando = false, sobreposta = false }) => (
        <>
            <img
                //CAMINHO RELATIVO (ex.: imagens/link.jpg DAS FOTOS SÓ DE LINK) É DO PAINEL ANTIGO, NÃO DO SPA
                src={/^https?:\/\//i.test(foto.thumb) ? foto.thumb : `${LEGACY_ORIGIN}/${String(foto.thumb).replace(/^\//, '')}`}
                alt=""
                draggable={false}
                className="absolute inset-0 size-full object-cover"
            />
            {foto.link && (
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 text-2xs text-white">
                    {foto.link}
                </span>
            )}
            {sobreposta && <span className="absolute inset-0 rounded-lg ring-2 ring-primary" />}
            {arrastando && <span className="absolute inset-0 rounded-lg bg-primary/10" />}
        </>
    )

    const FotoOrdenavel = ({ foto, posicao, selecionada, aoMarcar }) => {

        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: foto.id })
        const comShift = useRef(false)

        const estilo = {
            transform: CSS.Transform.toString(transform),
            transition,
        }

        return (
            <li
                ref={setNodeRef}
                style={estilo}
                {...attributes}
                {...listeners}
                aria-label={`Foto ${posicao + 1}. Arraste ou use espaço e as setas para mudar a ordem.`}
                className={clsx(
                    'group relative aspect-[4/3] overflow-hidden rounded-lg border bg-gray-100 outline-none',
                    'cursor-grab touch-none select-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary',
                    isDragging ? 'opacity-40' : 'hover:shadow-md',
                    selecionada ? 'border-primary ring-2 ring-primary' : 'border-gray-200'
                )}
            >
                <Miniatura foto={foto} />

                {/* MESMO CHECKBOX DAS LISTAGENS (CustomCheckbox cf-grid, COMO NO DataGridRowSelect).
                    CHECKBOX E "ABRIR" PARAM O ARRASTO NO pointerdown: SÃO CLIQUES, NÃO PEGAM A FOTO.
                    O SHIFT É LIDO NO pointerdown: O CLIQUE NO <label> GERA UM SEGUNDO click NO <input> QUE NÃO GARANTE O shiftKey */}
                <span
                    className="absolute left-1 top-1 inline-flex rounded-full bg-white/90 shadow-sm dark:bg-black/60"
                    onPointerDown={(e) => {
                        e.stopPropagation()
                        comShift.current = e.shiftKey
                    }}
                    onMouseDown={(e) => {
                        //SEM ISSO O SHIFT+CLIQUE SELECIONA O TEXTO DA PÁGINA
                        if (e.shiftKey) e.preventDefault()
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <CustomCheckbox
                        checked={selecionada}
                        onChange={(e) => {
                            const shift = comShift.current
                            comShift.current = false
                            aoMarcar(foto.id, e.target.checked, shift)
                        }}
                        ariaLabel={`Selecionar foto ${posicao + 1} (Shift+clique seleciona o intervalo)`}
                        className="cf-grid cf-sm"
                    />
                </span>

                {foto.url && (
                    <a
                        href={foto.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-md bg-white/95 text-gray-700 opacity-0 shadow-sm transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
                        aria-label={`Abrir foto ${posicao + 1} em nova aba`}
                        title="Abrir original"
                    >
                        <KeenIcon icon="exit-right-corner" className="text-sm" />
                    </a>
                )}
            </li>
        )

    }

    const PicturesGallery = ({ data }) => {

        const navigate = useNavigate()
        const [confirm, confirmDialog] = useConfirm()
        const sensores = useSensores()

        const [fotos, setFotos]           = useState(data?.items || [])
        const [marcadas, setMarcadas]     = useState(() => new Set())
        const [ativa, setAtiva]           = useState(null)
        const [arquivos, setArquivos]     = useState([])
        const [enviando, setEnviando]     = useState(false)
        const [soltando, setSoltando]     = useState(false)
        const [link, setLink]             = useState('')
        const [legenda, setLegenda]       = useState('')
        const ultimaMarcada               = useRef(null)
        const inputArquivos               = useRef(null)

        useEffect(() => {
            setFotos(data?.items || [])
            setMarcadas(new Set())
        }, [data])

        //SEM LIMITE DE FOTOS: O $qnt DO CARTÃO NÃO LIMITA NADA NO fotos.php (A CHECAGEM COMPARA mnr() DE UMA CONSULTA COM LIMIT 1,
        //ENTÃO NUNCA BARRA O ENVIO) — SÓ DEFINIA QUANTAS VAGAS VAZIAS A GRADE ANTIGA MOSTRAVA
        const fotoAtiva   = fotos.find((foto) => foto.id === ativa)

        //LISTA ATUALIZADA SEM O LOADER DE TELA INTEIRA DO callApi
        const recarregar = async () => {
            try {
                const response = await api.get(buildApiUrl(window.location.search))
                const resposta = dadosDaResposta(response)
                if (resposta?.params?.photos) {
                    setFotos(resposta.params.photos.items || [])
                    setMarcadas(new Set())
                }
            } catch (error) {
                mensagemErro(error?.response?.data?.error?.message)
            }
        }

        // ----- ENVIO -----

        const escolher = (lista) => {
            const imagens = Array.from(lista || []).filter((arquivo) => arquivo.type.startsWith('image/'))
            if (imagens.length !== (lista?.length || 0)) {
                toast.warning('Só imagens podem ser enviadas — os outros arquivos foram ignorados.')
            }
            setArquivos(imagens)
        }

        const enviar = async (e) => {

            e.preventDefault()

            if (arquivos.length === 0 && !(data?.link && link)) {
                toast.warning('Escolha ao menos uma imagem.')
                return
            }

            const dados = new FormData()
            arquivos.forEach((arquivo) => dados.append('FrmFoto[]', arquivo))
            dados.append('Enviar', 'ok')
            if (data?.link) dados.append('FrmLink', link)
            if (data?.caption) dados.append('FrmLegenda', legenda)

            setEnviando(true)

            try {

                const response = await api.post(buildApiUrl(window.location.search), dados, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })

                const galeria = dadosDaResposta(response)?.params?.photos

                if (galeria) {
                    setFotos(galeria.items || [])
                    if (galeria.message?.type === 'error') {
                        mensagemErro(galeria.message.text)
                    } else {
                        toast.success(galeria.message?.text || 'Fotos enviadas.')
                    }
                } else {
                    await recarregar()
                }

                setArquivos([])
                setLink('')
                setLegenda('')
                if (inputArquivos.current) inputArquivos.current.value = ''

            } catch (error) {
                mensagemErro(error?.response?.data?.error?.message || 'Não foi possível enviar as fotos.')
            } finally {
                setEnviando(false)
            }

        }

        // ----- ORDEM -----

        const salvarOrdem = async (novaOrdem, anterior) => {

            const params = new URLSearchParams(window.location.search)
            const consulta = new URLSearchParams({
                pag: params.get('pag') || params.get('slug') || '',
                acao: 'arrumaListagem',
                lista: '|' + novaOrdem.map((foto) => foto.id).join('|'),
            })

            try {
                await api.get(buildApiUrl('?' + consulta.toString()))
            } catch (error) {
                setFotos(anterior)
                mensagemErro(error?.response?.data?.error?.message || 'Não foi possível salvar a nova ordem.')
            }

        }

        const aoSoltar = ({ active, over }) => {

            setAtiva(null)
            if (!over || active.id === over.id) return

            const anterior = fotos
            const de       = fotos.findIndex((foto) => foto.id === active.id)
            const para     = fotos.findIndex((foto) => foto.id === over.id)
            const nova     = arrayMove(fotos, de, para)

            setFotos(nova)
            salvarOrdem(nova, anterior)

        }

        // ----- SELEÇÃO E EXCLUSÃO -----

        //SHIFT+CLIQUE MARCA/DESMARCA TODAS AS FOTOS ENTRE A ÚLTIMA CLICADA E ESTA (PARA FRENTE OU PARA TRÁS), COMO NAS
        //LISTAGENS (DataGridRowSelect). O INTERVALO É CALCULADO AQUI E NÃO DENTRO DO setMarcadas(fn): O REACT PODE RODAR
        //O UPDATER SÓ NO PRÓXIMO RENDER, QUANDO ultimaMarcada JÁ APONTA PARA ESTA FOTO — E O INTERVALO VIRAVA SÓ ELA
        const marcar = (id, ligar, comShift) => {

            const anterior = ultimaMarcada.current
            ultimaMarcada.current = id

            const de  = comShift && anterior !== null ? fotos.findIndex((foto) => foto.id === anterior) : -1
            const ate = fotos.findIndex((foto) => foto.id === id)

            const ids = de !== -1 && ate !== -1
                ? fotos.slice(Math.min(de, ate), Math.max(de, ate) + 1).map((foto) => foto.id)
                : [id]

            setMarcadas((atual) => {
                const proxima = new Set(atual)
                ids.forEach((cada) => (ligar ? proxima.add(cada) : proxima.delete(cada)))
                return proxima
            })

        }

        const todasMarcadas = fotos.length > 0 && marcadas.size === fotos.length

        const alternarTodas = () => {
            setMarcadas(todasMarcadas ? new Set() : new Set(fotos.map((foto) => foto.id)))
        }

        const excluir = async () => {

            if (marcadas.size === 0) return

            const ok = await confirm({
                title: marcadas.size === 1 ? 'Excluir foto?' : `Excluir ${marcadas.size} fotos?`,
                description: 'As fotos selecionadas serão apagadas. Essa ação não pode ser desfeita.',
            })
            if (!ok) return

            const params = new URLSearchParams(window.location.search)
            params.set('excluir', Array.from(marcadas).join('|'))

            try {

                //O fotos.php RESPONDE COM O REDIRECT DO LEGADO (…&exc=ok / exc=erro)
                const response = await api.get(buildApiUrl('?' + params.toString()), { responseType: 'text' })
                const retorno  = typeof response?.data === 'string' ? response.data : JSON.stringify(response?.data ?? '')

                if (/exc=ok/.test(retorno)) {
                    toast.success(marcadas.size === 1 ? 'Foto excluída.' : 'Fotos excluídas.')
                } else if (/exc=/.test(retorno)) {
                    mensagemErro('Algumas fotos não foram excluídas. Tente novamente.')
                }

            } catch (error) {
                mensagemErro(error?.response?.data?.error?.message || 'Não foi possível excluir as fotos.')
            }

            await recarregar()

        }

        return (
            <div className="grid gap-5">

                {confirmDialog}

                {/* ENVIO */}
                <form className="card" onSubmit={enviar}>
                    <div className="card-body grid gap-4">

                        <div
                            className={clsx(
                                'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-7 text-center transition-colors',
                                soltando ? 'border-primary bg-primary-light' : 'border-gray-300 bg-light'
                            )}
                            onDragOver={(e) => { e.preventDefault(); setSoltando(true) }}
                            onDragLeave={() => setSoltando(false)}
                            onDrop={(e) => { e.preventDefault(); setSoltando(false); escolher(e.dataTransfer.files) }}
                        >
                            <KeenIcon icon="picture" className="text-3xl text-gray-500" />
                            <div className="text-sm font-medium text-gray-900">Arraste as imagens para cá</div>
                            <div className="text-2sm text-gray-600">
                                ou{' '}
                                <button type="button" className="font-medium text-primary hover:underline" onClick={() => inputArquivos.current?.click()}>
                                    escolha no computador
                                </button>
                            </div>
                            {data?.recommended && (
                                <div className="text-2xs text-gray-500">Tamanho recomendado: {data.recommended}</div>
                            )}
                            <input
                                ref={inputArquivos}
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={(e) => escolher(e.target.files)}
                            />
                        </div>

                        {arquivos.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 text-2sm text-gray-700">
                                <KeenIcon icon="file-added" className="text-base text-primary" />
                                {arquivos.length === 1 ? arquivos[0].name : `${arquivos.length} imagens selecionadas`}
                                <button type="button" className="text-gray-500 hover:text-danger" onClick={() => setArquivos([])} aria-label="Limpar seleção de arquivos">
                                    <KeenIcon icon="cross" className="text-sm" />
                                </button>
                            </div>
                        )}

                        {(data?.link || data?.caption) && (
                            <div className="grid gap-3 sm:grid-cols-2 max-w-[700px]">
                                {data?.link && (
                                    <label className="grid gap-1.5 text-2sm font-medium text-gray-800">
                                        Link
                                        <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
                                    </label>
                                )}
                                {data?.caption && (
                                    <label className="grid gap-1.5 text-2sm font-medium text-gray-800">
                                        Legenda
                                        <input className="input" value={legenda} onChange={(e) => setLegenda(e.target.value)} />
                                    </label>
                                )}
                            </div>
                        )}

                        <div>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={enviando}>
                                <KeenIcon icon={enviando ? 'loading' : 'cloud-add'} className={clsx('!text-sm', enviando && 'animate-spin')} />
                                {enviando ? 'Enviando…' : 'Enviar'}
                            </button>
                        </div>

                    </div>
                </form>

                {/* GALERIA */}
                <div className="card">

                    <div className="card-header min-h-0 py-3.5 flex-wrap gap-2">
                        <h3 className="card-title text-sm">
                            Fotos
                            <span className="ms-1.5 font-normal text-gray-500">({fotos.length})</span>
                        </h3>
                        {fotos.length > 1 && (
                            <span className="text-2xs text-gray-500">Arraste para mudar a ordem</span>
                        )}
                    </div>

                    <div className="card-body">
                        {fotos.length === 0 ? (
                            <p className="py-10 text-center text-2sm text-gray-500">Nenhuma foto enviada ainda.</p>
                        ) : (
                            <DndContext
                                sensors={sensores}
                                collisionDetection={closestCenter}
                                onDragStart={({ active }) => setAtiva(active.id)}
                                onDragEnd={aoSoltar}
                                onDragCancel={() => setAtiva(null)}
                            >
                                <SortableContext items={fotos.map((foto) => foto.id)} strategy={rectSortingStrategy}>
                                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                                        {fotos.map((foto, i) => (
                                            <FotoOrdenavel
                                                key={foto.id}
                                                foto={foto}
                                                posicao={i}
                                                selecionada={marcadas.has(foto.id)}
                                                aoMarcar={marcar}
                                            />
                                        ))}
                                    </ul>
                                </SortableContext>

                                {/* CÓPIA QUE SEGUE O PONTEIRO: O ITEM DA GRADE FICA COMO VAGA (opacity-40) */}
                                <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(.2,.7,.3,1)' }}>
                                    {fotoAtiva ? (
                                        <div className="relative aspect-[4/3] cursor-grabbing overflow-hidden rounded-lg border border-primary shadow-xl scale-105">
                                            <Miniatura foto={fotoAtiva} />
                                        </div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        )}
                    </div>

                    {fotos.length > 0 && (
                        <div className="card-footer flex flex-wrap items-center justify-between gap-3 py-3">
                            <button
                                type="button"
                                className={clsx('btn btn-sm btn-danger transition-opacity', marcadas.size === 0 && 'opacity-40 cursor-not-allowed')}
                                disabled={marcadas.size === 0}
                                onClick={excluir}
                            >
                                <KeenIcon icon="trash" className="!text-sm" />
                                Excluir selecionadas{marcadas.size > 0 ? ` (${marcadas.size})` : ''}
                            </button>
                            <button type="button" className="text-2sm font-medium text-primary hover:underline" onClick={alternarTodas}>
                                {todasMarcadas ? 'Desmarcar todas' : 'Selecionar todas'}
                            </button>
                        </div>
                    )}

                </div>

                {data?.back && (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => navigate(cleanUrl(data.back).startsWith('?') ? '/' + cleanUrl(data.back) : cleanUrl(data.back))}
                            className="btn btn-sm btn-light text-sm gap-1.5"
                        >
                            <KeenIcon icon="arrow-left" className="text-base" />
                            Voltar
                        </button>
                    </div>
                )}

            </div>
        )

    }

    export { PicturesGallery }
