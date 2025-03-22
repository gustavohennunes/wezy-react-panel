    import qs from 'qs'
    import { useMemo, useState, useEffect } from 'react'
    import { DataGrid, KeenIcon, DataGridColumnHeader, DataGridRowSelectAll, DataRowContext } from '@/components'
    import { toast } from 'sonner'
    import { Input } from '@/components/ui/input'
    import { updateTablePagination, buildApiUrl, cleanUrl } from '@/utils/urlHelper'
    import { api } from '@/services/api'
    import { Tabs } from '@/components/custom/tabs/tabs'
    import { usePageData } from '@/context/PageDataContext'

    const Models = ({ model, columnHeader, btnAdd, search, btnExcluir, pagination, tabs }) => {

        const { callApi } = usePageData()
        const [models, setModels] = useState(model || [])
        const [footer, setFooter] = useState('')
        const [gridPagination, setGridPagination] = useState({ size: 20 })
        const [selectedRows, setSelectedRows] = useState([])
        const data = useMemo(() => models, [models])
        const [activeTab, setActiveTab] = useState('')

        useEffect(() => {

            if (model && Array.isArray(model) && model.length > 0) {
                setModels(model)
            }

        }, [model])

        useEffect(() => {

            if (pagination) {

                setGridPagination({
                    size: pagination?.information?.end || 0,
                    rowCount: pagination?.information?.total || 0,
                    pageCount: pagination?.buttons?.content?.length - 1 || 0,
                })

            }

        }, [pagination])

        const handleExcluir = async (e) => {

            try {

                const params = new URLSearchParams(e.view.location.search)
                const slug = params.get('slug') ?? params.get('pag')
                const data = {
                    items: selectedRows,
                }

                let response = ''
                const urlExcluir = `?slug=${slug}&acao=remove-items`

                response = await api.post(
                    buildApiUrl(urlExcluir),
                    qs.stringify(data),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                )

                const urlRefresh = buildApiUrl(
                    new URLSearchParams(e.view.location.search)
                )

                if (urlRefresh === false) {
                    return
                }

                callApi(urlRefresh)

                toast(`Sucesso`, {
                    description: response?.success?.response?.data?.message,
                })

            } catch (err) {

                toast(`Error atualizar`, {
                    description: `❌ Erro ao excluir item. ${err.response?.data?.error?.message ?? err}`,
                })

            }

        }

        const handleToggle = (rowId, colIndex) => {

            let response = ''
            try {

                setModels((prevModels) => {

                    const updatedModels = prevModels.map((row) => {

                        if (row['row-id'] === rowId) {

                            const updatedRow = { ...row }
                            updatedRow.columns = updatedRow.columns.map((col, i) => {

                                    if (i === colIndex) {

                                        response = api.post(
                                            buildApiUrl(col.action.toString())
                                        )

                                        return { ...col, content: !col.content }
                                    }

                                    return col

                                }

                            )

                            return updatedRow

                        }

                        return row
                        
                    })

                    return updatedModels

                })

            } catch (err) {

                toast(`Error atualizar`, {
                    description: `❌ Erro ao atualizar item.`,
                })

                setError(err)

            } finally {

                toast(`Sucesso!`, {
                    description: response?.success?.response.data.message,
                })

            }

        }

        const createColumns = (columnsData) => {

            if (!columnsData) return false

            return columnsData.map((col, index) => {
                
                return {
                    accessorKey: `col_${index}`,
                    id:
                        col.component === 'select_all_checkbox'
                            ? 'id'
                            : col?.content?.toLowerCase().replace(/\s/g, '_'),
                    header: ({ column }) =>
                        col.component === 'select_all_checkbox' ? (
                            <DataGridRowSelectAll
                                setSelectedRows={setSelectedRows}
                            />
                        ) : (
                            <DataGridColumnHeader
                                title={col.content}
                                column={column}
                                filter={false}
                            />
                        ),

                    enableSorting: false,
                    enableHiding: false,
                    cell: ({ row }) => {
                        return (
                            <DataRowContext
                                fullRow={row}
                                row={row.original.columns[index]}
                                index={index}
                                handleToggle={() =>
                                    handleToggle(row.original['row-id'], index)
                                }
                            />
                        )
                    },
                    meta: {
                        headerClassName: [
                            col.component === 'select_all_checkbox'
                                ? 'w-[90px]'
                                : col.width && col.width !== '0%'
                                ? `w-[${col.width}] min-w-[${col.width}]`
                                : 'w-full',
                            col.class ? col.class : '',
                            col.component === 'select_all_checkbox'
                                ? '!px-[12px]'
                                : col.align === 'left'
                                ? 'text-left justify-items-start !px-[15px]'
                                : col.align === 'center'
                                    ? 'text-center justify-items-center'
                                    : col.align === 'right'
                                    ? 'text-right justify-items-end'
                                    : '',
                        ]
                            .filter(Boolean)
                            .join(' '),

                        cellClassName: [
                            col.component === 'select_all_checkbox'
                                ? 'w-[90px]'
                                : col.width && col.width !== '0%'
                                ? `w-[${col.width}] min-w-[${col.width}]`
                                : 'w-full',
                            'text-gray-800 font-normal',
                            col.component === 'select_all_checkbox'
                                ? '!px-[12px]'
                                : col.align === 'left'
                                ? 'text-left justify-items-start !px-[15px]'
                                : col.align === 'center'
                                    ? 'text-center justify-items-center'
                                    : col.align === 'right'
                                    ? 'text-right justify-items-end'
                                    : '',
                        ]
                            .filter(Boolean)
                            .join(' '),

                        style: col.style
                            ? Object.fromEntries(
                                col.style
                                    .split(';')
                                    .map((rule) =>
                                        rule.split(':').map((s) => s.trim())
                                    )
                                    .filter(([key, value]) => key && value)
                            )
                            : {},
                    },
                }
            })
        }

        const column = useMemo(
            () => (columnHeader ? createColumns(columnHeader) : []),
            [columnHeader]
        )

        const handleRowSelection = (state) => {

            const selectedRowIds = Object.keys(state).filter((key) => {
                return state[key]
            })

            setSelectedRows(selectedRowIds)

        }

        const Toolbar = () => {

            const [searchInput, setSearchInput] = useState(search?.value || '')

            const submitSearch = (e) => {

                e.preventDefault()

                const url = new URL(search?.action, window.location.origin)

                url.searchParams.set('busca', searchInput)

                window.location.href = url.toString()

            }

            const addBtn = btnAdd?.label ? (

                <a
                    className="btn btn-dark btn-sm"
                    href={cleanUrl(btnAdd?.url)}
                    target="_self"
                >
                    <i className="ki-filled ki-plus"></i>
                    {btnAdd?.label}
                </a>

            ) : (
                ''
            )

            return (
                <div className="bg-transparent">

                    {tabs?.before && Array.isArray(tabs?.before) ? (

                        <div className="card-header flex-wrap gap-2 border-b-0 px-5">
                            <Tabs
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                tabs={tabs?.before}
                            />
                        </div>

                    ) : null}

                    {search !== undefined && addBtn !== undefined && (

                        <div className="card-header flex-wrap my-2 gap-2 border-b-0 px-5">

                            <h3 className="card-title font-medium text-sm">
                                {addBtn}
                            </h3>

                            {search !== undefined && (

                                <div className="flex flex-wrap gap-2 lg:gap-5">

                                    <form
                                        id="form2"
                                        name="form2"
                                        method="post"
                                        action={search?.action}
                                        onSubmit={(e) => submitSearch(e)}
                                        className="flex form-busca"
                                    >

                                        <label className="input input-sm">
                                            <input
                                                type="text"
                                                name="FrmBusca"
                                                id="FrmBusca"
                                                className="inputBusca"
                                                placeholder={search?.placeholder}
                                                value={searchInput}
                                                onChange={(e) =>
                                                    setSearchInput(e.target.value)
                                                }
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            className="btn btn-dark btn-sm ml-1"
                                        >
                                            <KeenIcon
                                                icon="magnifier"
                                                className="!text-sm"
                                            />
                                        </button>

                                    </form>

                                </div>

                            )}

                        </div>
                    )}

                    {tabs?.after && Array.isArray(tabs?.after) ? (
                        <div className="card-header justify-start flex-wrap gap-2 border-b-0 px-5">
                            {tabs?.after?.map((afterTab, i) => {
                                return (
                                    <a
                                        key={i}
                                        className="btn btn-primary"
                                        href={
                                            !afterTab.url ||
                                            afterTab.url === 'javascript:;'
                                                ? ''
                                                : cleanUrl(afterTab.url)
                                        }
                                        target={afterTab.target ?? '_self'}
                                    >
                                        {afterTab.content}
                                    </a>
                                )
                            })}
                        </div>
                    ) : null}
                </div>
            )
        }

        useEffect(() => {

            if (btnExcluir !== false) {

                setFooter(
                    <div className="card-title font-medium text-sm mt-3">
                        <button
                            className={`btn btn-sm btn-danger ${selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={selectedRows.length === 0}
                            onClick={handleExcluir}
                        >
                            Excluir selecionados
                        </button>
                    </div>
                )

            } else {
                setFooter('')
            }

        }, [btnExcluir, selectedRows])

        const fetchGridData = async (params) => {
            
            try {

                if (params.pageIndex == 0) {
                    return {
                        data: data,
                        totalCount: pagination?.information?.total || 0,
                    }
                }

                let newUrl = await updateTablePagination(params)
                const response = await api.get(newUrl)

                return {
                    data: response.data?.success?.response?.data?.params?.list
                        ?.rows,
                    totalCount:
                        response?.data?.success?.response?.data?.params?.pagination
                            ?.information?.total,
                }

            } catch (error) {

                toast(`Error de dados`, {
                    description: `❌ Erro ao carregar dados da página.`,
                    action: {
                        label: 'Ok',
                        onClick: () => console.log('Ok'),
                    },
                })

                return {
                    data: [],
                    totalCount: 0,
                }

            } finally {
                //setLoading(false);
            }

        }

        return (
            <div>
                <DataGrid
                    columns={column}
                    data={data}
                    rowSelection={true}
                    onRowSelectionChange={handleRowSelection}
                    pagination={gridPagination}
                    onFetchData={fetchGridData}
                    getRowId={(row) => row['row-id']}
                    sorting={[
                        {
                            id: 'id',
                            desc: false,
                        },
                    ]}
                    serverSide={true}
                    toolbar={<Toolbar />}
                    layout={{
                        card: true,
                    }}
                />
                {footer}
            </div>
        )
    }

    export { Models }
