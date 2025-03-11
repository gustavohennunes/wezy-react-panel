import React, { useState, useEffect } from 'react'
import { useDataGrid } from '.'
import { Checkbox } from '@/components/ui/checkbox'
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

    

    return (
        <Checkbox
            checked={
                selectedRowIds.length === selectableRowIds.length &&
                selectableRowIds.length > 0
            }
            onCheckedChange={(value) => checkAllRows(value)}
            aria-label="Select all"
            className="align-[inherit]"
        />
    )
}
export { DataGridRowSelectAll }
