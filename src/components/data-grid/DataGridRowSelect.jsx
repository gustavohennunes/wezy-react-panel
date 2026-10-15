import React, { useRef } from 'react'
import { CustomCheckbox } from '@/components/form/CustomFields'
import { useDataGrid } from './DataGridContext'

//ÚLTIMA LINHA CLICADA DE CADA TABELA (PONTO DE PARTIDA DO SHIFT+CLIQUE). WeakMap: NÃO SEGURA TABELAS DESMONTADAS
const ultimaClicada = new WeakMap()

// MESMO CHECKBOX DO FORMULÁRIO (estilo painel-php) — A VARIANTE cf-grid SÓ
// REMOVE OS DESLOCAMENTOS DE FORMULÁRIO PARA ALINHAR NA CÉLULA DA TABELA.
// SHIFT+CLIQUE: MARCA (OU DESMARCA) TODAS AS LINHAS ENTRE A ÚLTIMA CLICADA E ESTA, COMO NO GMAIL
const DataGridRowSelect = ({ row }) => {

    const { table } = useDataGrid()

    //O SHIFT É LIDO NO mousedown: O CLIQUE NO <label> GERA UM SEGUNDO click (NO <input>) QUE NÃO GARANTE O shiftKey
    const comShift = useRef(false)

    const aoPressionar = (e) => {
        comShift.current = e.shiftKey
        //SEM ISSO O SHIFT+CLIQUE SELECIONA O TEXTO DAS LINHAS NO MEIO
        if (e.shiftKey) e.preventDefault()
    }

    const aoMudar = (e) => {

        const marcar   = e.target.checked
        const shift    = comShift.current
        comShift.current = false

        const linhas   = table?.getRowModel().rows || []
        const anterior = table ? ultimaClicada.get(table) : undefined

        if (table) ultimaClicada.set(table, row.id)

        const de  = shift && anterior !== undefined ? linhas.findIndex((r) => r.id === anterior) : -1
        const ate = de !== -1 ? linhas.findIndex((r) => r.id === row.id) : -1

        if (de === -1 || ate === -1) {
            row.toggleSelected(marcar)
            return
        }

        const selecao = { ...table.getState().rowSelection }
        for (let i = Math.min(de, ate); i <= Math.max(de, ate); i++) {
            const linha = linhas[i]
            if (!linha.getCanSelect()) continue
            if (marcar) {
                selecao[linha.id] = true
            } else {
                delete selecao[linha.id]
            }
        }

        table.setRowSelection(selecao)

    }

    return (
        <span onMouseDownCapture={aoPressionar} className="inline-flex">
            <CustomCheckbox
                checked={row.getIsSelected()}
                onChange={aoMudar}
                ariaLabel="Selecionar linha (Shift+clique seleciona o intervalo)"
                className="cf-grid"
            />
        </span>
    )

}

export { DataGridRowSelect }
