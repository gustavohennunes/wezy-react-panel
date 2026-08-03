import React, { useState, useEffect } from 'react'
import { useDataGrid } from '.'
import { CustomCheckbox } from '@/components/form/CustomFields'

const DataGridRowSelectAll = ({ setSelectedRows }) => {
    const { table } = useDataGrid()
    const [selectableRowIds, setSelectableRowIds] = useState([])
    const [selectedRowIds, setSelectedRowIds] = useState([])
    const [selectedDataTableIds, setSelectedDataTableIds] = useState([])

    useEffect(() => {
        const selectableRows = table
            .getRowModel()
            .rows.filter((row) => row.original.columns[0].content !== '-')

        setSelectableRowIds(selectableRows.map((row) => row.id))
    }, [table])

    useEffect(() => {
        setSelectedRows(selectedRowIds)
    }, [selectedRowIds])

    const checkAllRows = (value) => {
        const updatedSelected = value ? selectableRowIds : []

        setSelectedRowIds(updatedSelected)
        selectableRowIds.forEach((id) => {
            table.getRow(id)?.toggleSelected(!!value)
        })
    }

    // MESMO CHECKBOX DO FORMULÁRIO (estilo painel-php), VARIANTE cf-grid
    return (
        <CustomCheckbox
            checked={
                selectedRowIds.length === selectableRowIds.length &&
                selectableRowIds.length > 0
            }
            onChange={(e) => checkAllRows(e.target.checked)}
            ariaLabel="Select all"
            className="cf-grid"
        />
    )
}

export { DataGridRowSelectAll }
