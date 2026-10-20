'use client'

import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    getFacetedRowModel,
    getFacetedUniqueValues,
} from '@tanstack/react-table'
import {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
} from 'react'
import { DataGridInner } from './DataGridInner'
import { deepMerge, debounce } from '@/lib/helpers'

//ARRAY VAZIO FIXO: UM [] NOVO A CADA RENDER FARIA A TABELA RECALCULAR AS LINHAS SEMPRE
const SEM_DADOS = []

//PADRÕES DO GRID QUE AS PROPS SOBRESCREVEM
const VALORES_PADRAO = {
    messages: {
        empty: 'Nenhum conteúdo encontrado!',
        loading: 'carregando...',
    },
    layout: {
        cellSpacing: 'md',
        cellBorder: true,
        card: false,
    },
    pagination: {
        info: '{from} - {to} de {count}',
        sizes: [5, 10, 20, 50, 100],
        sizesLabel: 'Show',
        sizesDescription: 'por página',
        size: 10,
        page: 0,
        moreLimit: 5,
        more: false,
    },
    rowSelection: false,
    serverSide: false,
}

const DataGridContext = createContext(undefined)

export const useDataGrid = () => {
    const context = useContext(DataGridContext)

    if (!context) {
        return { table: null }
    }

    return context
}

export const DataGridProvider = (props) => {
    //MESMAS PROPS = MESMO OBJETO (O value DO CONTEXTO ABAIXO SÓ MUDA QUANDO ALGO MUDA DE VERDADE)
    const mergedProps = useMemo(() => deepMerge(VALORES_PADRAO, props), [props])
    const [data, setData] = useState(mergedProps.data || [])
    const [loading, setLoading] = useState(false)
    const [totalRows, setTotalRows] = useState(
        mergedProps.data ? mergedProps.data.length : 0
    )

    const [pagination, setPagination] = useState({
        pageIndex: props.pagination?.page ?? 0,
        pageSize: props.pagination?.size ?? 10,
    })

    // O pageSize É CAPTURADO NO useState ACIMA SÓ NA MONTAGEM; SE O PAI TROCAR
    // props.pagination.size DEPOIS (ex.: modo "Carregar mais" do Models), A TABELA
    // FICAVA PRESA NO TAMANHO INICIAL E ESCONDIA AS LINHAS EXCEDENTES.
    // AJUSTE DURANTE O RENDER (NÃO NUM useEffect), SEM UM FRAME COM O TAMANHO ANTIGO
    const sizeDoPai = props.pagination?.size
    const [sizeAnterior, setSizeAnterior] = useState(sizeDoPai)
    if (sizeDoPai !== sizeAnterior) {
        setSizeAnterior(sizeDoPai)
        if (sizeDoPai && sizeDoPai !== pagination.pageSize) {
            setPagination((prev) => ({ ...prev, pageSize: sizeDoPai }))
        }
    }

    const [rowSelection, setRowSelection] = useState(mergedProps.rowSelection)
    const [sorting, setSorting] = useState(mergedProps.sorting ?? [])
    const [columnFilters, setColumnFilters] = useState([])
    const [columnVisibility, setColumnVisibility] = useState({})

    const fetchServerSideData = useCallback(async () => {
        if (loading) return

        setLoading(true)

        try {
            const requestParams = {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
                sorting,
                columnFilters,
            }

            const { data, totalCount } =
                await mergedProps.onFetchData(requestParams)

            setData(data || [])
            setTotalRows(totalCount || 0)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }, [loading, pagination, sorting, columnFilters, mergedProps])

    //O debounce PRECISA SER O MESMO ENTRE RENDERS (UM NOVO A CADA RENDER NÃO SEGURAVA NADA); A REF LEVA O FETCH ATUAL
    const fetchRef = useRef(fetchServerSideData)
    useLayoutEffect(() => {
        fetchRef.current = fetchServerSideData
    })
    const debouncedFetchData = useMemo(() => debounce(() => fetchRef.current(), 100), [])

    //DADOS LOCAIS (serverSide false) VÃO DIRETO PARA A TABELA, SEM CÓPIA EM STATE: A CÓPIA POR useEffect
    //FAZIA A TABELA DESENHAR UM FRAME COM AS LINHAS ANTIGAS A CADA MUDANÇA (ex.: FILTRO AO DIGITAR)
    const dadosLocais = props.data || SEM_DADOS
    const tableData   = mergedProps.serverSide ? data : dadosLocais
    const tableTotal  = mergedProps.serverSide ? totalRows : dadosLocais.length

    const serverSide = mergedProps.serverSide

    const loadData = useCallback(() => {
        if (serverSide) {
            debouncedFetchData()
        }
    }, [serverSide, debouncedFetchData])

    // Trigger debounced fetch for server-side data; local data goes straight to the table
    useEffect(() => {
        loadData()
    }, [loadData, pagination, sorting, columnFilters])

    const handleRowSelectionChange = (updaterOrValue) => {
        setRowSelection((prev) =>
            typeof updaterOrValue === 'function'
                ? updaterOrValue(prev)
                : updaterOrValue
        )
        if (mergedProps.onRowSelectionChange) {
            const newSelection =
                typeof updaterOrValue === 'function'
                    ? updaterOrValue(rowSelection)
                    : updaterOrValue
            mergedProps.onRowSelectionChange(newSelection, table)
        }
    }

    const table = useReactTable({
        data: tableData,
        columns: mergedProps.columns,
        pageCount: mergedProps.serverSide
            ? Math.ceil(totalRows / pagination.pageSize)
            : undefined,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: mergedProps.getRowId || ((row, index) => String(index)),
        enableRowSelection: mergedProps.rowSelection,
        onRowSelectionChange: handleRowSelectionChange,
        onSortingChange: (newSorting) => !loading && setSorting(newSorting),
        onColumnFiltersChange: (newFilters) =>
            !loading && setColumnFilters(newFilters),
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: (newPagination) =>
            !loading && setPagination(newPagination),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: mergedProps.serverSide,
        manualSorting: mergedProps.serverSide,
        manualFiltering: mergedProps.serverSide,
    })

    //O table DO TanStack É O MESMO OBJETO ENTRE RENDERS: O ESTADO DELE ENTRA NAS DEPENDÊNCIAS PARA OS LEITORES DO CONTEXTO
    //VEREM A MUDANÇA (ORDEM, SELEÇÃO, PAGINAÇÃO, DADOS)
    const tableState = table.getState()
    const value = useMemo(
        () => ({ props: mergedProps, table, totalRows: tableTotal, loading, setLoading, reload: loadData }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [mergedProps, table, tableTotal, loading, loadData, tableData, tableState.sorting, tableState.rowSelection, tableState.columnFilters, tableState.columnVisibility, tableState.pagination]
    )

    return (
        <DataGridContext.Provider value={value}>
            <DataGridInner />
        </DataGridContext.Provider>
    )
}
