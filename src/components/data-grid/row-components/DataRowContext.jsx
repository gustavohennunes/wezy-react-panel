import { DataRowToggle, DataRowActionsMenu, DataRowPicture } from '.'
import { DataGridRowSelect } from '@/components'
export const DataRowContext = ({ fullRow, row, index, handleToggle }) => {

    if(!row) return;

    if (row.component === 'checkbox_delete') {
        // CHECKBOX
        return <DataGridRowSelect row={fullRow} />
    } else if (
        row.component === 'menu_dropdown' &&
        Array.isArray(row.content)
    ) {
        // MENU AÇÕES
        return <DataRowActionsMenu row={row} />
    } else if (row.component === 'photo_preview') {
        return <DataRowPicture row={row}/>
    } else if (row.component === 'toggle') {
        // TOOGLE
        return (
            <DataRowToggle
                row={row}
                fullRow={fullRow}
                handleToggle={() =>
                    handleToggle(fullRow.original['row-id'], index)
                }
            />
        )
    }

    return row.content || '-'
}
