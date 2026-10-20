import { useDataGrid } from '.'
import { CustomCheckbox } from '@/components/form/CustomFields'

// "SELECIONAR TODOS" DO GRID. AS LINHAS SELECIONÁVEIS SÃO CALCULADAS A CADA RENDER A PARTIR DAS
// LINHAS ATUAIS DA TABELA — ANTES ERAM GUARDADAS UMA VEZ SÓ (O OBJETO table NÃO MUDA) E IGNORAVAM
// O "Carregar mais" E O FILTRO AO DIGITAR, PODENDO MARCAR LINHAS QUE NEM ESTAVAM NA TELA.
// A SELEÇÃO VIVE NO ESTADO DA TABELA; QUEM USA O GRID RECEBE PELO onRowSelectionChange.
const DataGridRowSelectAll = () => {
    const { table } = useDataGrid()

    //LINHA COM "-" NA PRIMEIRA COLUNA NÃO TEM CHECKBOX (REGISTRO SEM PERMISSÃO DE EXCLUSÃO)
    const selectableRows = table
        .getRowModel()
        .rows.filter((row) => row.original?.columns?.[0]?.content !== '-')

    const allSelected = selectableRows.length > 0 && selectableRows.every((row) => row.getIsSelected())

    //UMA ÚNICA ATUALIZAÇÃO DO ESTADO DE SELEÇÃO (EM VEZ DE UM toggleSelected POR LINHA)
    const checkAllRows = (value) => {
        table.setRowSelection((selecaoAtual) => {
            const novaSelecao = { ...selecaoAtual }
            selectableRows.forEach((row) => {
                if (value) {
                    novaSelecao[row.id] = true
                } else {
                    delete novaSelecao[row.id]
                }
            })
            return novaSelecao
        })
    }

    // MESMO CHECKBOX DO FORMULÁRIO (estilo painel-php), VARIANTE cf-grid
    return (
        <CustomCheckbox
            checked={allSelected}
            onChange={(e) => checkAllRows(e.target.checked)}
            ariaLabel="Selecionar todos"
            className="cf-grid"
        />
    )
}

export { DataGridRowSelectAll }
