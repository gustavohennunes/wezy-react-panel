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
    useState,
    useCallback,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { DataGridInner } from './DataGridInner'
import { deepMerge, debounce } from '@/lib/helpers'
import { usePageData } from '@/context/PageDataContext'
import { updateTablePagination } from '@/utils/urlHelper'

const DataGridContext = createContext(undefined)

export const useDataGrid = () => {
    const context = useContext(DataGridContext)

    if (!context) {
        return { table: null }
    }

    return context
}

export const DataGridProvider = (props) => {
    const { callApi } = usePageData()

    const defaultValues = {
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

    const mergedProps = deepMerge(defaultValues, props)
    const [data, setData] = useState(mergedProps.data || [])
    const [loading, setLoading] = useState(false)
    const { pageData } = usePageData()
    const [totalRows, setTotalRows] = useState(
        mergedProps.data ? mergedProps.data.length : 0
    )

    const [pagination, setPagination] = useState({
        pageIndex: props.pagination?.page ?? 0,
        pageSize: props.pagination?.size ?? 10,
    })

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
    }, [loading, pagination, sorting, columnFilters, mergedProps.onFetchData])

    const debouncedFetchData = debounce(fetchServerSideData, 100)

    const loadData = () => {
        if (mergedProps.serverSide) {
            debouncedFetchData()
        } else {
            setLoading(true) // Show loading bar for local data
            setData(mergedProps.data || [])
            setTotalRows(mergedProps.data ? mergedProps.data.length : 0)
            setLoading(false) // Hide loading bar after data is set
        }
    }

    // Trigger debounced fetch for server-side data; load local data if serverSide is false
    useEffect(() => {
        loadData()
    }, [
        pagination,
        sorting,
        columnFilters,
        mergedProps.data,
        mergedProps.serverSide,
    ])

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
        data,
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

    return (
        <DataGridContext.Provider
            value={{
                props: mergedProps,
                table,
                totalRows,
                loading,
                setLoading,
                reload: loadData,
            }}
        >
            <DataGridInner />
        </DataGridContext.Provider>
    )
}
