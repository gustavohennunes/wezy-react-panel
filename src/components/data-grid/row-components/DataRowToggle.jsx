export const DataRowToggle = ({ row, fullRow, handleToggle }) => {
    return (
        <div className="flex items-center mb-2">
            <label className="switch switch-sm">
                <input
                    type="checkbox"
                    checked={row.content}
                    onChange={() => handleToggle(fullRow.index)}
                />
                <span className="slider round"></span>
            </label>
        </div>
    )
}
