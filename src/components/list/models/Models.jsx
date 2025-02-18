import { useMemo, useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DataGrid,
    KeenIcon,
    DataGridColumnHeader,
    DataGridRowSelect,
    DataGridRowSelectAll,
    useDataGrid,
    DataRowContext,
} from '@/components'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
const Models = ({ model, columnHeader, btnAdd, search, btnExcluir }) => {
    const ColumnInputFilter = ({ column }) => {
        return (
            <Input
                placeholder="Filter..."
                value={column.getFilterValue() ?? ''}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className="h-9 w-full max-w-40"
            />
        )
    }
    const [models, setModels] = useState(model || [])
    const [footer, setFooter] = useState("")
    const [selectedRows, setSelectedRows] = useState([])

    useEffect(() => {
        if (model && Array.isArray(model) && model.length > 0) {
            setModels(model)
        }
    }, [model])

    const handleExcluir = (id) => {
        //TODO excluir da API linhas selecionadas
        console.log("Linhas a serem excluidas: "+selectedRows)
    }

    const handleToggle = (index) => {
        setModels((prevModels) => {
            const updatedModels = [...prevModels]
            updatedModels[index] = {
                ...updatedModels[index],
                switch: !updatedModels[index].switch,
            }
            return updatedModels
        })
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
                        <DataGridRowSelectAll />
                    ) : (
                        <DataGridColumnHeader
                            title={col.content}
                            column={column}
                            filter={<ColumnInputFilter column={column} />}
                        />
                    ),

                enableSorting: true,
                cell: ({ row }) => {
                    return (
                        <DataRowContext
                            fullRow={row}
                            row={row.original.columns[index]}
                            index={index}
                            handleToggle={handleToggle}
                        />
                    )
                },
                meta: {
                    headerClassName: [
                        col.width && col.width !== '0%'
                            ? `w-[${col.width}]`
                            : '',
                        col.class ? col.class : '',
                        col.align === 'left'
                            ? 'text-left'
                            : col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                                ? 'text-right'
                                : '',
                    ]
                        .filter(Boolean)
                        .join(' '),

                    cellClassName: [
                        col.width && col.width !== '0%'
                            ? `w-[${col.width}]`
                            : '',
                        'text-gray-800 font-normal',
                        col.align === 'left'
                            ? 'text-left'
                            : col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                                ? 'text-right'
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
    const data = useMemo(() => models, [models]) // Use models state

    const handleRowSelection = (state) => {
        const selectedRowIds = Object.keys(state)
        setSelectedRows(selectedRowIds)
        if (selectedRowIds.length > 0) {
            toast(`Total de ${selectedRowIds.length} linhas estão selecionadas.`, {
                description: `Linhas selecionadas: ${selectedRowIds}`,
                action: {
                    label: 'Desfazer',
                    onClick: () => setSelectedRows([]),
                },
            })
        }
    }

    const Toolbar = () => {
        const { table } = useDataGrid()
        const [searchInput, setSearchInput] = useState(search?.value)
        //const addBtn = btnAdd?.label ? <a className="btn btn-primary" href={btnAdd?.url}>{btnAdd?.label}</a> : "";
        const addBtn = btnAdd?.label ? (
            <a
                className="btn btn-primary"
                //href={btnAdd?.url}
                href="?pag=administracao&acao=Inserir"
                target="_self"
            >
                {btnAdd?.label}
            </a>
        ) : (
            ''
        )
        return (
            <div className="card-header flex-wrap gap-2 border-b-0 px-5">
                <h3 className="card-title font-medium text-sm">{addBtn}</h3>

                <div className="flex flex-wrap gap-2 lg:gap-5">
                    <form
                        id="form2"
                        name="form2"
                        method="post"
                        action={search?.action}
                        className="flex form-busca"
                    >
                        <label className="input input-sm">
                            <input
                                type="text"
                                name="FrmBusca"
                                id="FrmBusca"
                                className="inputBusca"
                                placeholder={search?.placeholder}
                                value={search?.value}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </label>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm ml-1"
                        >
                            <KeenIcon icon="magnifier" />
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (btnExcluir) {
            setFooter(
                <div className="card-title font-medium text-sm mt-3">
                    <a
                        className={`btn btn-danger ${selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={selectedRows.length === 0}
                        onClick={() => handleExcluir}
                    >
                        Excluir selecionados
                    </a>
                </div>
            )
        }
    }, [btnExcluir, selectedRows])

    if (!data || data.length === 0) {
        return <Skeleton className="h-8" />
    }

    return (
        <div>
            <DataGrid
                columns={column}
                data={data}
                rowSelection={true}
                onRowSelectionChange={handleRowSelection}
                pagination={{
                    size: 20,
                }}
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
