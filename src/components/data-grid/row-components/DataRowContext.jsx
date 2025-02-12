import { DataRowToggle, DataRowActionsMenu } from ".";
import {
  DataGridRowSelect,
} from "@/components";
export const DataRowContext = ({fullRow, row, index, handleToggle}) => {

  if (row.component === "checkbox_delete") {
    // CHECKBOX
    return <DataGridRowSelect row={fullRow} />
  } else if (row.component === "menu_dropdown" && Array.isArray(row.content)) {
    // MENU AÇÕES
    return <DataRowActionsMenu row={row}/>;
  }  else if (row.component === "toggle") {
    // TOOGLE
    return (
      <DataRowToggle row={row} fullRow={fullRow} handleToggle={handleToggle} />
    )
  }

  return row.content || "-";
};
