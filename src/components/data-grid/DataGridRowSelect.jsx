import React from 'react'
import { CustomCheckbox } from '@/components/form/CustomFields'

// MESMO CHECKBOX DO FORMULÁRIO (estilo painel-php) — A VARIANTE cf-grid SÓ
// REMOVE OS DESLOCAMENTOS DE FORMULÁRIO PARA ALINHAR NA CÉLULA DA TABELA
const DataGridRowSelect = ({ row }) => {
    return (
        <CustomCheckbox
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            ariaLabel="Select row"
            className="cf-grid"
        />
    )
}
export { DataGridRowSelect }
