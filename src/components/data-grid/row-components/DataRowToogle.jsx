import { DataRowSelector } from ".";
export const DataRowToggle = (props) => {
    return (
      <div className="flex items-center mb-2">
        <label className="switch switch-sm">
            <input
            type="checkbox"
            checked={props.userSwitch}
            onChange={() => handleToggle(props.row.index)} // Use row.index for the correct user
            />
            <span className="slider round"></span>
        </label>               
      </div>
    );
  }
