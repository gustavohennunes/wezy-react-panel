import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import {
  DataGrid,
  KeenIcon,
  DataGridColumnHeader,
  DataGridRowSelect,
  DataGridRowSelectAll,
  useDataGrid,
} from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModelsData } from "./";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
const Models = () => {
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
  const [models, setModels] = useState(ModelsData); // Initialize state with ModelsData

  const handleToggle = (index) => {
    setModels((prevModels) => {
      const updatedModels = [...prevModels];
      updatedModels[index] = {
        ...updatedModels[index],
        switch: !updatedModels[index].switch, // Toggle the switch state
      };
      return updatedModels;
    });
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: () => <DataGridRowSelectAll />,
        cell: ({ row }) => <DataGridRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-0",
        },
      },
      {
        accessorFn: (row) => row.user,
        id: "models",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Cliente"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          return row.original.name;
        },
        meta: {
          className: "min-w-[200px]",
          cellClassName: "font-normal text-gray-800",
        },
      },
      {
        accessorFn: (row) => row.branch,
        id: "branch",
        header: ({ column }) => (
          <DataGridColumnHeader title="Dominio" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.email;
        },
        meta: {
          className: "min-w-[165px]",
          cellClassName: "text-gray-800 font-normal",
        },
      },
      {
        accessorFn: (row) => row.labels,
        id: "label",
        header: ({ column }) => (
          <DataGridColumnHeader title="Pais" column={column} />
        ),
        enableSorting: true,
        cell: (info) => {
          return info.row.original.country;
        },
        meta: {
          className: "min-w-[225px]",
        },
      },
      {
        accessorFn: (row) => row.switch,
        id: "switch",
        header: ({ column }) => (
          <DataGridColumnHeader title="2FA" column={column} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const userSwitch = row.original.switch;
          return (
            <div className="flex items-center mb-2">
              <label className="switch switch-sm">
                <input
                  type="checkbox"
                  checked={userSwitch}
                  onChange={() => handleToggle(row.index)} // Use row.index for the correct user
                />
                <span className="slider round"></span>
              </label>
            </div>
          );
        },
        meta: {
          className: "min-w-[100px]",
        },
      },
      {
        id: "edit",
        header: () => "",
        enableSorting: false,
        cell: () => {
          return (
            <button className="btn btn-sm btn-icon btn-clear btn-light">
              <KeenIcon icon="dots-vertical" />
            </button>
          );
        },
        meta: {
          headerClassName: "w-[60px]",
        },
      },
    ],
    []
  );
  const data = useMemo(() => models, [models]); // Use models state

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
    const [searchInput, setSearchInput] = useState("");
    return (
      <div className="card-header flex-wrap gap-2 border-b-0 px-5">
        <h3 className="card-title font-medium text-sm">Header</h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex">
            <label className="input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Pesquisar"
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
  return (
    <DataGrid
      columns={columns}
      data={data}
      rowSelection={true}
      onRowSelectionChange={handleRowSelection}
      pagination={{
        size: 5,
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
