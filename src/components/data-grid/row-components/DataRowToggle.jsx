import { useEffect, useState } from 'react'
export const DataRowToggle = ({ row, fullRow, handleToggle }) => {
    const [toggleState, setToggleState] = useState(row.content)

    const handleToggleItem = () => {
        setToggleState(!toggleState)
        handleToggle()
    }

    return (
        <div className="flex items-center mb-2">
            <label className="switch switch-sm">
                <input
                    type="checkbox"
                    checked={toggleState}
                    onChange={handleToggleItem}
                />
                <span className="slider round"></span>
            </label>
        </div>
    )
}
