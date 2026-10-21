    import { DataGridColumnHeader, DataGridRowSelectAll, DataRowContext } from '@/components'

    // ESTILO INLINE DECLARADO PELO CARD (ex.: 'color:#F00;') VIRA OBJETO DE style
    const estiloDoCartao = (style) =>
        style
            ? Object.fromEntries(
                style
                    .split(';')
                    .map((rule) => rule.split(':').map((s) => s.trim()))
                    .filter(([key, value]) => key && value)
            )
            : {}

    // CRIA AS COLUNAS DO GRID A PARTIR DO CABEÇALHO QUE A PONTE MANDA (list.header)
    const criarColunas = (columnsData, { handleToggle, removeItems, destaque }) => {

        if (!columnsData) return []

        return columnsData.map((col, index) => {

            const isCheckbox = col.component === 'select_all_checkbox'

            // A LARGURA VEM DA PONTE COMO '12.9%' OU '110px'. ANTES ERA APLICADA VIA
            // CLASSE TAILWIND DINÂMICA (w-[${col.width}]) — QUE NUNCA FUNCIONA, PORQUE O
            // JIT SÓ GERA CSS DAS CLASSES QUE ENXERGA EM TEMPO DE BUILD. RESULTADO: TODAS
            // AS COLUNAS FICAVAM COM LARGURA AUTOMÁTICA E O TEXTO QUEBRAVA EM VÁRIAS LINHAS.
            const hasWidth = col.width && col.width !== '0%' && col.width !== '0'

            const columnStyle = {}

            if (isCheckbox) {
                columnStyle.width = '52px'
                columnStyle.minWidth = '52px'
            } else if (hasWidth) {
                columnStyle.width = col.width
            }

            columnStyle.textAlign = col.align === 'center' ? 'center' : col.align === 'right' ? 'right' : 'left'

            return {
                accessorKey: `col_${index}`,
                id: isCheckbox ? 'id' : col?.content?.toLowerCase().replace(/\s/g, '_'),
                header: ({ column }) => isCheckbox ? (
                    <DataGridRowSelectAll />
                ) : (
                    <DataGridColumnHeader
                        title={col.content}
                        column={column}
                        filter={false}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => (
                    <DataRowContext
                        fullRow={row}
                        row={row.original.columns[index]}
                        index={index}
                        //PASSA A FUNÇÃO DIRETO: uma closure aqui descartaria os argumentos
                        //que o DataRowContext envia (id, índice e a própria célula com o action)
                        handleToggle={handleToggle}
                        onRemoveItems={removeItems}
                        destaque={destaque}
                    />
                ),
                meta: {
                    headerClassName: [
                        isCheckbox ? '!ps-4 !pe-2' : '!px-3',
                        'whitespace-nowrap',
                        col.class ? col.class : '',
                    ]
                        .filter(Boolean)
                        .join(' '),

                    cellClassName: [
                        isCheckbox ? '!ps-4 !pe-2' : '!px-3',
                        'text-gray-800 font-normal align-middle',
                    ].join(' '),

                    headerStyle: columnStyle,
                    cellStyle: { ...columnStyle, ...estiloDoCartao(col.style) },
                },
            }
        })
    }

    export { criarColunas }
