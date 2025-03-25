import { useDataGrid } from '.'

const DataGridEmpty = () => {

    const { table, props } = useDataGrid()

    const totalColumns = table.getAllColumns().length + (props.rowSelection ? 1 : 0)

    return (
        <tr>
            <td
                colSpan={totalColumns}
                className="text-center text-muted-foreground py-44 font-semibold"
            >
                {props.messages?.empty || ''}
            </td>
        </tr>
    )

}

export { DataGridEmpty }
