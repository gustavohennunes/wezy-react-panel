import { useMemo, useState } from "react";
import Skeleton from 'react-loading-skeleton'
import {
  DataGrid,
  KeenIcon,
  DataGridColumnHeader,
  DataGridRowSelect,
  DataGridRowSelectAll,
  useDataGrid,
  DataRowContext
} from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
const Models = ({model, columnHeader, btnAdd, search}) => {
  const ColumnInputFilter = ({ column }) => {
    return (
      <Input
        placeholder="Filter..."
        value={column.getFilterValue() ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };
  const [models, setModels] = useState(model);

  const handleToggle = (index) => {
    setModels((prevModels) => {
      const updatedModels = [...prevModels];
      updatedModels[index] = {
        ...updatedModels[index],
        switch: !updatedModels[index].switch,
      };
      return updatedModels;
    });
  };

  const createColumns = (columnsData) => {
    if(!columnsData) return false;

    return columnsData.map((col, index) => {

      return {
      accessorKey: `col_${index}`,
      id: col.component === "select_all_checkbox" ? (
        'id'
      ) : col?.content?.toLowerCase().replace(/\s/g, "_"),
      header: ({ column }) => 
        col.component === "select_all_checkbox" ? (
          <DataGridRowSelectAll />
        ) : (
          <DataGridColumnHeader 
            title={col.content} 
            column={column} 
            filter={<ColumnInputFilter column={column} />} 
          />
        ),
      
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <DataRowContext fullRow={row} row={row.original.columns[index]} index={index} handleToggle={handleToggle}/>    
        );        
      },
      meta: {
        className: col.class || "",
        cellClassName: "text-gray-800 font-normal",
      },
    }});
  };

  const teste = useMemo(() => columnHeader ? createColumns(columnHeader) : [], [columnHeader]);
  //const data = useMemo(() => models, [models]); // Use models state

  const handleRowSelection = (state) => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
  };
  const Toolbar = () => {
    const { table } = useDataGrid();
    const [searchInput, setSearchInput] = useState(search?.value);
    const addBtn = btnAdd?.label ? <button className="btn btn-primary">{btnAdd?.label}</button> : "";
    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">
          {addBtn}
        </h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex">
            <label className="input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder={search?.placeholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Select defaultValue="active">
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="latest">
              <SelectTrigger className="w-28" size="sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="w-32">
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="older">Older</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>

            <button className="btn btn-sm btn-outline btn-primary">
              <KeenIcon icon="setting-4" /> Filters
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  if (!teste || teste.length === 0) {
    return <Skeleton />;
  }

  return (
    <DataGrid
      columns={teste}
      data={model}
      rowSelection={true}
      onRowSelectionChange={handleRowSelection}
      pagination={{
        size: 20,
      }}
      sorting={[
        {
          id: "id",
          desc: false,
        },
      ]}
      toolbar={<Toolbar />}
      layout={{
        card: true,
      }}
    />
  );
};
export { Models };
