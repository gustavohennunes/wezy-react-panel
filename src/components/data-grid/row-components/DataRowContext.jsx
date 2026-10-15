import { DataRowToggle, DataRowActionsMenu, DataRowPicture } from '.'
import { DataGridRowSelect } from '@/components'
import { LegacyHtml } from '@/components/legacy/LegacyHtml'
export const DataRowContext = ({ fullRow, row, index, handleToggle }) => {
    if (!row) return

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
        return <DataRowPicture row={row} />
    } else if (row.component === 'toggle') {
        // TOOGLE
        return (
            <DataRowToggle
                row={row}
                fullRow={fullRow}
                handleToggle={() =>
                    handleToggle(fullRow.original['row-id'], index, row)
                }
            />
        )
    } else if (row.component === 'html') {
        // RETORNA COMO TEXTO
        return row.content || '-'
    }

    if (row.content) {

        //SÓ AS CÉLULAS COM <script> OU <form> DO CARTÃO PASSAM PELO LegacyHtml (EXECUTA E ENVIA PARA A API);
        //AS DEMAIS CONTINUAM COM O innerHTML SIMPLES, MAIS LEVE PARA LISTAGENS GRANDES
        if (typeof row.content === 'string' && /<(script|form)\b/i.test(row.content)) {
            return <LegacyHtml html={row.content} />
        }

        return <div dangerouslySetInnerHTML={{ __html: row.content }} />
    }

    return row.content || '-'
}
