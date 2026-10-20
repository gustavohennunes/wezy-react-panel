    import { useRef, useState } from 'react'
    import clsx from 'clsx'
    import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
    import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
    import { CSS } from '@dnd-kit/utilities'
    import { KeenIcon } from '@/components/keenicons'
    import { CustomCheckbox } from '@/components/form/CustomFields'
    import { LEGACY_ORIGIN } from '@/utils/legacyIcons'

    //ÁREA DE ARRASTO: SÓ MOVE DEPOIS DE 6px (CLIQUE NO CHECKBOX OU NO "ABRIR" NÃO VIRA ARRASTO)
    const useSensores = () => useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    //CAMINHO RELATIVO (ex.: imagens/link.jpg DAS FOTOS SÓ DE LINK) É DO PAINEL ANTIGO, NÃO DO SPA
    const srcDaMiniatura = (thumb) => (/^https?:\/\//i.test(thumb) ? thumb : `${LEGACY_ORIGIN}/${String(thumb).replace(/^\//, '')}`)

    const Miniatura = ({ foto }) => (
        <>
            <img
                src={srcDaMiniatura(foto.thumb)}
                alt=""
                draggable={false}
                className="absolute inset-0 size-full object-cover"
            />
            {foto.link && (
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 text-2xs text-white">
                    {foto.link}
                </span>
            )}
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
                    O SHIFT É LIDO NO pointerdown: O CLIQUE NO <label> GERA UM SEGUNDO click NO <input> QUE NÃO GARANTE O shiftKey.
                    role="presentation": O SPAN SÓ ISOLA OS EVENTOS DO CHECKBOX DENTRO DELE, QUE É O CONTROLE DE VERDADE */}
                <span
                    role="presentation"
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

    // GRADE ORDENÁVEL (ARRASTAR COM O MOUSE OU ESPAÇO + SETAS). onReordenar RECEBE A NOVA ORDEM JÁ APLICADA
    const GradeDeFotos = ({ fotos, marcadas, onMarcar, onReordenar }) => {

        const sensores = useSensores()
        const [ativa, setAtiva] = useState(null)
        const fotoAtiva = fotos.find((foto) => foto.id === ativa)

        const aoSoltar = ({ active, over }) => {

            setAtiva(null)
            if (!over || active.id === over.id) return

            const de   = fotos.findIndex((foto) => foto.id === active.id)
            const para = fotos.findIndex((foto) => foto.id === over.id)

            onReordenar(arrayMove(fotos, de, para))

        }

        return (
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
                                aoMarcar={onMarcar}
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
        )

    }

    export { GradeDeFotos }
