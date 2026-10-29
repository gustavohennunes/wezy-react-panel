import { DataGridEmpty } from '.'
import { flexRender } from '@tanstack/react-table'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useDataGrid } from '.'
import { cn } from '@/lib/utils'
import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { tratarCliqueEmLinkDoLegado } from '@/components/legacy/cliqueEmLinkDoLegado'

//ARRASTAR SÓ NO EIXO VERTICAL E SEM SAIR DO <tbody>
const MODIFICADORES = [restrictToVerticalAxis, restrictToParentElement]

const ACESSIBILIDADE = {
    screenReaderInstructions: {
        draggable: 'Para reordenar, pressione Espaço ou Enter, use as setas para mover e pressione Espaço ou Enter de novo para soltar. Esc cancela.',
    },
}

//ELEMENTOS ONDE O ARRASTAR PELA LINHA NÃO COMEÇA: O CLIQUE NELES TEM QUE CONTINUAR FUNCIONANDO
//(A PRÓPRIA ALÇA É UM <button> E TEM OS LISTENERS DELA)
const INTERATIVOS = 'a, button, input, select, textarea, label, [contenteditable], [role="checkbox"], [role="switch"], [data-no-dnd]'

//LINHA ARRASTÁVEL (props.onRowReorder): ARRASTA PELA LINHA INTEIRA COM O MOUSE, MENOS EM CIMA DE LINK, BOTÃO E
//CAMPO. A ALÇA À ESQUERDA SINALIZA QUE DÁ PARA REORDENAR E É POR ONDE FUNCIONA O TECLADO E O TOQUE (NO CELULAR
//A LINHA PRECISA CONTINUAR ROLANDO A PÁGINA)
const LinhaOrdenavel = ({ row, desativado, className, celulaAlca, children }) => {

    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
        useSortable({ id: row.id, disabled: desativado })

    //SÓ O onPointerDown VAI PARA A LINHA: O onKeyDown NELA PEGARIA O Espaço DE UM CHECKBOX FOCADO E COMEÇARIA O ARRASTE
    const arrastarPelaLinha = (event) => {
        if (desativado || event.target.closest(INTERATIVOS)) return
        listeners?.onPointerDown?.(event)
    }

    return (
        <tr
            ref={setNodeRef}
            data-state={row.getIsSelected() ? 'selected' : undefined}
            onPointerDown={arrastarPelaLinha}
            className={cn(
                className,
                !desativado && 'cursor-grab',
                isDragging && 'relative z-10 bg-light shadow-lg cursor-grabbing'
            )}
            style={{ transform: CSS.Translate.toString(transform), transition }}
        >
            <td className={celulaAlca}>
                <button
                    type="button"
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                    disabled={desativado}
                    aria-label="Arrastar para reordenar"
                    title={desativado ? 'Limpe o filtro para reordenar' : 'Arrastar para reordenar'}
                    className={cn(
                        'flex items-center justify-center size-6 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 touch-none',
                        desativado ? 'cursor-not-allowed opacity-40' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    )}
                >
                    <GripVertical className="size-4" />
                </button>
            </td>
            {children}
        </tr>
    )

}

//LINHAS EM HTML DO CARTÃO NUM <tbody> PRÓPRIO ANTES DO CORPO DO GRID: GANHAM O ESPAÇAMENTO E A BORDA DAS LINHAS DO GRID
//E, NA LISTAGEM ORDENÁVEL, UMA CÉLULA VAZIA NO LUGAR DA ALÇA PARA AS COLUNAS NÃO DESALINHAREM. LINK ?pag= VAI PELO ROUTER
const LinhasHtmlNoTopo = ({ html, ordenavel, classeCelula, classeLinha }) => {

    const corpoRef = useRef(null)
    const navigate = useNavigate()

    useLayoutEffect(() => {

        const corpo = corpoRef.current
        if (!corpo) return

        //SÓ UMA VEZ POR HTML: O innerHTML SÓ É RECRIADO QUANDO O html MUDA
        corpo.querySelectorAll(':scope > tr:not([data-linha-ajustada])').forEach((tr) => {
            tr.setAttribute('data-linha-ajustada', '')
            tr.className = cn(tr.className, classeLinha)
            if (ordenavel) tr.insertBefore(document.createElement('td'), tr.firstChild)
            tr.querySelectorAll(':scope > td').forEach((td) => {
                td.className = cn(td.className, classeCelula)
            })
        })

    }, [html, ordenavel, classeCelula, classeLinha])

    return (
        <tbody
            ref={corpoRef}
            className="legacy-html"
            onClick={(event) => tratarCliqueEmLinkDoLegado(event, navigate)}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )

}

const DataGridTable = () => {
    const { table, props } = useDataGrid()

    const sensores = useSensors(
        //5px ANTES DE COMEÇAR A ARRASTAR: UM CLIQUE SIMPLES NA ALÇA NÃO MOVE NADA
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const headCellSpacingOptions = {
        xs: '!px-[5px] !py-[6px] text-[13px]',
        sm: '!px-[5px] !py-[6px] text-[13px]',
        md: '!px-[5px] !py-[6px] text-[13px]',
        lg: '!px-[5px] !py-[6px] text-[13px]',
    }

    const bodyCellSpacingOptions = {
        xs: 'px-[5px] !py-1',
        sm: 'px-[5px] !py-1',
        md: 'px-[5px] !py-1',
        lg: 'px-[5px] !py-1.5',
        //LINHAS ESPAÇADAS — USADO PELAS LISTAGENS DO PAINEL (Models.jsx)
        xl: 'px-[5px] !py-3',
    }

    const headCellSpacing = props.layout?.cellSpacing
        ? headCellSpacingOptions[props.layout?.cellSpacing]
        : headCellSpacingOptions['md']
    const bodyCellSpacing = props.layout?.cellSpacing
        ? bodyCellSpacingOptions[props.layout?.cellSpacing]
        : bodyCellSpacingOptions['md']

    const cellBorder = props.layout?.cellBorder ?? false

    const ordenavel = typeof props.onRowReorder === 'function'
    const linhas    = table.getRowModel().rows

    const classeLinha = cn(
        'border-b hover:bg-muted/30 data-[state=selected]:bg-muted/50',
        cellBorder && '[&_>:last-child]:border-e-0'
    )

    const celulas = (row) =>
        row.getVisibleCells().map((cell) => (
            <td
                key={cell.id}
                style={cell.column.columnDef.meta?.cellStyle}
                className={cn(
                    bodyCellSpacing,
                    cellBorder && 'border-e',
                    'align-middle [&:has([role=checkbox])]:pe-0 !text-[13px]',
                    cell.column.columnDef.meta
                        ?.cellClassName
                )}
            >
                {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                )}
            </td>
        ))

    const aoSoltar = ({ active, over }) => {
        if (over && active.id !== over.id) {
            props.onRowReorder(active.id, over.id)
        }
    }

    const corpo = linhas.length ? (
        linhas.map((row) =>
            ordenavel ? (
                <LinhaOrdenavel
                    key={row.id}
                    row={row}
                    desativado={Boolean(props.rowReorderDisabled)}
                    className={classeLinha}
                    celulaAlca={cn(bodyCellSpacing, cellBorder && 'border-e', 'align-middle w-[34px] !pe-0')}
                >
                    {celulas(row)}
                </LinhaOrdenavel>
            ) : (
                <tr
                    key={row.id}
                    data-state={
                        row.getIsSelected() ? 'selected' : undefined
                    }
                    className={classeLinha}
                >
                    {celulas(row)}
                </tr>
            )
        )
    ) : (
        <DataGridEmpty />
    )

    const tabela = (
        <table
            className={cn(
                'w-full align-middle text-left rtl:text-right caption-bottom text-sm',
                props.layout?.classes?.table
            )}
            data-table
        >
            <thead className="[&_tr]:border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                        key={headerGroup.id}
                        className={cn(
                            'border-b bg-muted/30 data-[state=selected]:bg-muted',
                            cellBorder && '[&_>:last-child]:border-e-0'
                        )}
                    >
                        {ordenavel && (
                            <th className={cn(headCellSpacing, cellBorder && 'border-e', 'h-11 w-[34px]')}>
                                <span className="sr-only">Ordem</span>
                            </th>
                        )}
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                colSpan={header.colSpan}
                                style={header.column.columnDef.meta?.headerStyle}
                                className={cn(
                                    headCellSpacing,
                                    cellBorder && 'border-e',
                                    'h-11 min-w-[20px] text-left rtl:text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pe-0',
                                    header.column.columnDef.meta
                                        ?.headerClassName
                                )}
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            {/* props.linhasHtmlNoTopo: <tr> CRUS DO CARTÃO ($novoResultadoInicial) COMO PRIMEIRAS LINHAS DA PRÓPRIA TABELA */}
            {props.linhasHtmlNoTopo && (
                <LinhasHtmlNoTopo
                    html={props.linhasHtmlNoTopo}
                    ordenavel={ordenavel}
                    classeCelula={cn(bodyCellSpacing, cellBorder && 'border-e', 'align-middle !text-[13px]')}
                    classeLinha={classeLinha}
                />
            )}
            <tbody className="[&_tr:last-child]:border-0">
                {ordenavel ? (
                    <SortableContext items={linhas.map((row) => row.id)} strategy={verticalListSortingStrategy}>
                        {corpo}
                    </SortableContext>
                ) : (
                    corpo
                )}
            </tbody>
        </table>
    )

    if (!ordenavel) {
        return tabela
    }

    return (
        <DndContext
            sensors={sensores}
            collisionDetection={closestCenter}
            modifiers={MODIFICADORES}
            onDragEnd={aoSoltar}
            accessibility={ACESSIBILIDADE}
        >
            {tabela}
        </DndContext>
    )
}
export { DataGridTable }
