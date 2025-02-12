//import { DataRowSelector } from ".";
import {
  DataGridRowSelect,
} from "@/components";
export const DataRowContext = ({fullRow, row, index, handleToggle}) => {
  console.log(row);
  console.log(row.content);
  console.log(Array.isArray(row.content));

  if (row.component === "checkbox_delete") {
    // CHECKBOX
    return <DataGridRowSelect row={fullRow} />
  } else if (Array.isArray(row.content)) {
    // MENU AÇÕES
    return row.content[0].title || "-";
  }  else if (row.component === "toggle") {
    // TOOGLE
    return (
      <div className="flex items-center mb-2">
        <label className="switch switch-sm">
          <input
            type="checkbox"
            checked={row.content}
            onChange={() => handleToggle(fullRow.index)} // Use row.index for the correct user
          />
          <span className="slider round"></span>
        </label>
      </div>
    )
  }

  return row.content || "-";
};
