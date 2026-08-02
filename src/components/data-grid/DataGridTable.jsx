import { DataGridEmpty } from '.'
import { flexRender } from '@tanstack/react-table'
import { useDataGrid } from '.'
import { cn } from '@/lib/utils'
const DataGridTable = () => {
    const { table, props } = useDataGrid()

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
    }

    const headCellSpacing = props.layout?.cellSpacing
        ? headCellSpacingOptions[props.layout?.cellSpacing]
        : headCellSpacingOptions['md']
    const bodyCellSpacing = props.layout?.cellSpacing
        ? bodyCellSpacingOptions[props.layout?.cellSpacing]
        : bodyCellSpacingOptions['md']

    const cellBorder = props.layout?.cellBorder ?? false

    return (
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
            <tbody className="[&_tr:last-child]:border-0">
                {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            data-state={
                                row.getIsSelected() ? 'selected' : undefined
                            }
                            className={cn(
                                'border-b hover:bg-muted/30 data-[state=selected]:bg-muted/50',
                                cellBorder && '[&_>:last-child]:border-e-0'
                            )}
                        >
                            {row.getVisibleCells().map((cell) => (
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
                            ))}
                        </tr>
                    ))
                ) : (
                    <DataGridEmpty />
                )}
            </tbody>
        </table>
    )
}
export { DataGridTable }
